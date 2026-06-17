# StallPulse

**StallPulse** is a data monetization system that turns Singapore public F&B licensing and transport data into hawker centre location viability scores — delivered via a Next.js dashboard and REST API.

## Product summary

| Layer | Technology |
|-------|------------|
| Ingestion | Python + data.gov.sg REST APIs |
| Storage | CSV/JSON (raw), Parquet (processed) |
| Processing | Pandas batch scoring pipeline |
| Delivery | Next.js 16 on Vercel |

**Target customer:** Aspiring hawker stall operators and small F&B businesses (1–3 outlets) evaluating locations in Singapore.

**Business model:** S$29/mo Starter (10 reports), S$99/mo Pro (unlimited + API).

## Repository structure

```
final/
├── report/              # LaTeX report (report.tex → report.pdf)
├── scripts/
│   ├── ingest/          # data.gov.sg fetch scripts
│   ├── process/         # viability scoring pipeline
│   ├── demand-research/ # demand evidence collection
│   └── run_pipeline.py  # run full pipeline
├── data/
│   ├── raw/             # ingested CSV/JSON
│   └── processed/       # scored Parquet + JSON
├── web/                 # Next.js dashboard + API (Vercel)
├── requirements.txt     # Python dependencies
├── README.md            # this file
└── VERCEL.md            # Vercel deployment guide
```

## Architecture

```
data.gov.sg (NEA + LTA APIs)
        │
        ▼
  Python ingestion ──► data/raw/
        │
        ▼
  Pandas batch scoring ──► data/processed/
        │
        ▼
  Next.js (Vercel) ──► Dashboard + /api/locations
```

## Prerequisites

- **Python 3.10+** (for data pipeline)
- **Node.js 20+** (for web app)
- **LaTeX** (optional, for PDF report: `pdflatex`)

## Run locally

### 1. Data pipeline

```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run full pipeline (ingest → process)
python scripts/run_pipeline.py

# Or run steps individually:
python scripts/ingest/fetch_establishments.py   # ~5 min (rate-limited)
python scripts/ingest/fetch_mrt_stations.py
python scripts/process/score_locations.py
python scripts/demand-research/collect_demand_evidence.py
```

> **Note:** `fetch_establishments.py` paginates 36,687 records from data.gov.sg. The API rate-limits aggressive requests; the script uses 1s delays and exponential backoff on HTTP 429.

### 2. Web dashboard

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. API

```bash
# List all locations
curl http://localhost:3000/api/locations

# Filter by planning area
curl "http://localhost:3000/api/locations?area=Rochor&min_score=70"

# Search by name
curl "http://localhost:3000/api/locations?q=Tekka"
```

### 4. PDF report

```bash
cd report
pdflatex report.tex
pdflatex report.tex   # run twice for TOC
```

Output: `report/report.pdf`

## Deployed version

Deploy to Vercel following [VERCEL.md](./VERCEL.md). After deployment, set your live URL here:

```
https://your-project.vercel.app
```

## Demand research reproduction

Evidence collected for the report (Section 2) can be regenerated:

```bash
source .venv/bin/activate
python scripts/demand-research/collect_demand_evidence.py
```

Output: `data/processed/demand_evidence.json` (Reddit search results, interview summaries, pricing benchmarks, WTP estimates).

## Data sources

| Dataset | URL |
|---------|-----|
| NEA Licensed Eating Establishments | [data.gov.sg](https://data.gov.sg/datasets/d_227473e811b09731e64725f140b77697) |
| LTA MRT Station Names | [data.gov.sg](https://data.gov.sg/datasets/d_d312a5b127e1ae74299b8ae664cedd4e) |
| Hawker AMR benchmarks | Curated from [NEA tender notices](https://www.nea.gov.sg/our-services/hawker-management/becoming-a-hawker) |

## License

Academic project for NTU Big Data Systems. Government data used under the [Singapore Open Data Licence](https://data.gov.sg/open-data-licence).
