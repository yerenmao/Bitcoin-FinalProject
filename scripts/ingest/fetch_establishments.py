#!/usr/bin/env python3
"""
Ingest NEA licensed eating establishments from data.gov.sg Datastore API.
Paginates through all ~36K records and writes raw JSON + CSV to data/raw/.
"""

import json
import os
import sys
import time
from pathlib import Path

import pandas as pd
import requests

RESOURCE_ID = "d_227473e811b09731e64725f140b77697"
BASE_URL = "https://data.gov.sg/api/action/datastore_search"
PAGE_SIZE = 500
ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "data" / "raw"


def fetch_page(offset: int, retries: int = 5) -> dict:
    params = {"resource_id": RESOURCE_ID, "limit": PAGE_SIZE, "offset": offset}
    for attempt in range(retries):
        resp = requests.get(BASE_URL, params=params, timeout=60)
        if resp.status_code == 429:
            wait = 2 ** attempt
            print(f"  Rate limited; waiting {wait}s...")
            time.sleep(wait)
            continue
        resp.raise_for_status()
        return resp.json()
    resp.raise_for_status()
    return resp.json()


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    all_records: list[dict] = []
    offset = 0
    total = None

    print("Fetching NEA licensed eating establishments from data.gov.sg...")
    while True:
        payload = fetch_page(offset)
        if not payload.get("success"):
            print(f"API error: {payload}", file=sys.stderr)
            sys.exit(1)

        result = payload["result"]
        records = result["records"]
        if total is None:
            total = result["total"]
            print(f"Total records: {total}")

        all_records.extend(records)
        print(f"  Fetched {len(all_records)}/{total} records...")
        offset += PAGE_SIZE

        if len(all_records) >= total or not records:
            break
        time.sleep(1.0)  # polite rate limiting for data.gov.sg

    json_path = RAW_DIR / "nea_establishments.json"
    csv_path = RAW_DIR / "nea_establishments.csv"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_records, f, indent=2, ensure_ascii=False)

    df = pd.DataFrame(all_records)
    df.to_csv(csv_path, index=False)

    print(f"Saved {len(all_records)} records to:")
    print(f"  {json_path}")
    print(f"  {csv_path}")


if __name__ == "__main__":
    main()
