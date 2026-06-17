export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 bg-white">
      <h1 className="text-3xl font-bold text-slate-900">About StallPulse</h1>
      <p className="mt-4 text-slate-600 leading-relaxed">
        StallPulse monetizes public F&B licensing and transport data by turning
        it into actionable location intelligence for hawker stall entrepreneurs.
        Our batch pipeline ingests ~37K NEA licensed establishments, enriches
        hawker centre records with MRT proximity and Assessed Market Rent (AMR)
        benchmarks, and delivers viability scores via this dashboard and REST
        API.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-slate-900">Architecture</h2>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`data.gov.sg APIs
    │
    ▼
Python ingestion (batch) ──► Raw CSV/JSON (data/raw/)
    │
    ▼
Pandas scoring pipeline ──► Parquet + JSON (data/processed/)
    │
    ▼
Next.js on Vercel ──► Dashboard + /api/locations`}
      </pre>

      <h2 className="mt-8 text-xl font-semibold text-slate-900">Business model</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
        <li>Starter: S$29/month — 10 location reports</li>
        <li>Pro: S$99/month — unlimited reports + API access</li>
        <li>Enterprise: custom pricing for food court operators</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-slate-900">Data sources</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
        <li>
          <a
            href="https://data.gov.sg/datasets/d_227473e811b09731e64725f140b77697"
            className="text-orange-600 hover:underline"
          >
            NEA Licensed Eating Establishments
          </a>
        </li>
        <li>
          <a
            href="https://data.gov.sg/datasets/d_d312a5b127e1ae74299b8ae664cedd4e"
            className="text-orange-600 hover:underline"
          >
            LTA MRT Station Names
          </a>
        </li>
        <li>NEA Hawker Tender AMR benchmarks (curated CSV)</li>
      </ul>
    </div>
  );
}
