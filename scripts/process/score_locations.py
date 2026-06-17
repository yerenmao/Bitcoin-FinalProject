#!/usr/bin/env python3
"""
Batch processing pipeline: aggregate competition density, compute location viability scores,
and write processed Parquet + JSON for the delivery layer.

Scoring model (0–100):
  - Foot traffic proxy (MRT proximity): 35%
  - Competition gap (stalls vs cuisine saturation): 25%
  - Rent affordability (AMR vs market median): 20%
  - Hygiene cluster quality (avg grade nearby): 10%
  - Demographic fit (planning area density): 10%
"""

import json
import re
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw"
OUT_DIR = ROOT / "data" / "processed"
WEB_DATA = ROOT / "web" / "public" / "data"

GRADE_SCORE = {"A": 1.0, "B": 0.7, "C": 0.4, "D": 0.2}


def extract_postal(address: str) -> str | None:
    if not isinstance(address, str):
        return None
    match = re.search(r"SINGAPORE\s+(\d{6})", address.upper())
    return match.group(1) if match else None


def extract_area_prefix(postal: str | None) -> str | None:
    if postal is None or (isinstance(postal, float) and pd.isna(postal)):
        return None
    postal_str = str(postal)
    if len(postal_str) >= 2:
        return postal_str[:2]
    return None


def load_establishments() -> pd.DataFrame:
    csv_path = RAW_DIR / "nea_establishments.csv"
    if not csv_path.exists():
        raise FileNotFoundError(
            f"Missing {csv_path}. Run: python scripts/ingest/fetch_establishments.py"
        )
    df = pd.read_csv(csv_path)
    df["postal"] = df["premises_address"].apply(extract_postal)
    df["postal_prefix"] = df["postal"].apply(extract_area_prefix)
    df["grade_score"] = df["grade"].map(GRADE_SCORE).fillna(0.5)
    return df


def load_hawker_centres() -> pd.DataFrame:
    path = RAW_DIR / "hawker_centres_amr.csv"
    return pd.read_csv(path)


def competition_by_prefix(establishments: pd.DataFrame) -> pd.DataFrame:
    grouped = (
        establishments.dropna(subset=["postal_prefix"])
        .groupby("postal_prefix")
        .agg(
            competitor_count=("licence_number", "count"),
            avg_grade_score=("grade_score", "mean"),
        )
        .reset_index()
    )
    return grouped


def score_centres(centres: pd.DataFrame, competition: pd.DataFrame) -> pd.DataFrame:
    centres = centres.copy()
    competition = competition.copy()
    centres["postal_prefix"] = centres["postal_prefix"].astype(str)
    competition["postal_prefix"] = competition["postal_prefix"].astype(str)
    df = centres.merge(competition, on="postal_prefix", how="left")
    df["competitor_count"] = df["competitor_count"].fillna(0)
    df["avg_grade_score"] = df["avg_grade_score"].fillna(0.7)

    median_amr = df["median_amr_sgd"].median()
    median_comp = df["competitor_count"].median()

    # Normalize sub-scores to 0–1
    df["foot_traffic_score"] = (1 - df["mrt_distance_km"].clip(0, 2) / 2).clip(0, 1)
    df["competition_gap_score"] = (
        1 - (df["competitor_count"] / max(median_comp * 2, 1)).clip(0, 1)
    )
    df["rent_affordability_score"] = (
        1 - (df["median_amr_sgd"] / max(median_amr * 2, 1)).clip(0, 1)
    )
    df["hygiene_score"] = df["avg_grade_score"]
    df["density_score"] = (df["stall_count_estimate"] / 300).clip(0, 1)

    df["viability_score"] = (
        0.35 * df["foot_traffic_score"]
        + 0.25 * df["competition_gap_score"]
        + 0.20 * df["rent_affordability_score"]
        + 0.10 * df["hygiene_score"]
        + 0.10 * df["density_score"]
    ).round(3)

    df["viability_score"] = (df["viability_score"] * 100).round(1)
    df["tier"] = pd.cut(
        df["viability_score"],
        bins=[0, 40, 60, 80, 100],
        labels=["Low", "Moderate", "Good", "Excellent"],
        include_lowest=True,
    ).astype(str)

    df["estimated_monthly_rent_sgd"] = df["median_amr_sgd"]
    df["competition_density"] = df["competitor_count"].astype(int)

    return df.sort_values("viability_score", ascending=False)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    WEB_DATA.mkdir(parents=True, exist_ok=True)

    print("Loading raw data...")
    establishments = load_establishments()
    centres = load_hawker_centres()
    competition = competition_by_prefix(establishments)

    print(f"  Establishments: {len(establishments)}")
    print(f"  Hawker centres: {len(centres)}")

    scored = score_centres(centres, competition)

    parquet_path = OUT_DIR / "location_scores.parquet"
    json_path = OUT_DIR / "location_scores.json"
    web_json = WEB_DATA / "location_scores.json"

    scored.to_parquet(parquet_path, index=False)

    records = scored.to_dict(orient="records")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)
    with open(web_json, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    summary = {
        "total_centres": len(scored),
        "avg_viability_score": round(scored["viability_score"].mean(), 1),
        "top_centre": scored.iloc[0]["centre_name"],
        "top_score": scored.iloc[0]["viability_score"],
        "processed_at": pd.Timestamp.now(tz="Asia/Singapore").isoformat(),
    }
    with open(OUT_DIR / "pipeline_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\nTop 5 locations by viability score:")
    for _, row in scored.head(5).iterrows():
        print(f"  {row['centre_name']}: {row['viability_score']} ({row['tier']})")

    print(f"\nWrote processed data to {parquet_path} and {web_json}")


if __name__ == "__main__":
    main()
