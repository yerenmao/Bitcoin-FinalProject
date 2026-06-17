#!/usr/bin/env python3
"""
Ingest MRT station locations from data.gov.sg (LTA Train Station Chinese Names).
Provides station name + line for proximity scoring.
"""

import json
import sys
from pathlib import Path

import pandas as pd
import requests

RESOURCE_ID = "d_d312a5b127e1ae74299b8ae664cedd4e"
BASE_URL = "https://data.gov.sg/api/action/datastore_search"
ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw"


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    params = {"resource_id": RESOURCE_ID, "limit": 500}
    resp = requests.get(BASE_URL, params=params, timeout=60)
    resp.raise_for_status()
    payload = resp.json()

    if not payload.get("success"):
        print(f"API error: {payload}", file=sys.stderr)
        sys.exit(1)

    records = payload["result"]["records"]
    df = pd.DataFrame(records)

    # Normalize column names
    rename = {
        "mrt_station_english": "station_name",
        "mrt_line_english": "line",
        "stn_code": "station_code",
    }
    for old, new in rename.items():
        if old in df.columns:
            df = df.rename(columns={old: new})

    csv_path = RAW_DIR / "mrt_stations.csv"
    json_path = RAW_DIR / "mrt_stations.json"
    df.to_csv(csv_path, index=False)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    print(f"Saved {len(records)} MRT stations to {csv_path}")


if __name__ == "__main__":
    main()
