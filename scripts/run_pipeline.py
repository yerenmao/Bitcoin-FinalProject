#!/usr/bin/env python3
"""Run full ingestion + processing pipeline."""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"


def run(script: str) -> None:
    path = SCRIPTS / script
    print(f"\n{'='*60}\nRunning {path.name}...\n{'='*60}")
    subprocess.check_call([sys.executable, str(path)])


def main() -> None:
    run("ingest/fetch_establishments.py")
    run("ingest/fetch_mrt_stations.py")
    run("process/score_locations.py")
    print("\nPipeline complete.")


if __name__ == "__main__":
    main()
