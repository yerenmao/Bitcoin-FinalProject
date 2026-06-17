import type { LocationScore } from "@/lib/types";
import { tierColor } from "@/lib/types";

interface Props {
  location: LocationScore;
}

const METRICS: {
  key: keyof LocationScore;
  label: string;
  format: (v: number) => string;
}[] = [
  { key: "foot_traffic_score", label: "Foot traffic (MRT)", format: pct },
  { key: "competition_gap_score", label: "Competition gap", format: pct },
  { key: "rent_affordability_score", label: "Rent affordability", format: pct },
  { key: "hygiene_score", label: "Hygiene cluster", format: pct },
  { key: "density_score", label: "Market density", format: pct },
];

function pct(v: number) {
  return `${Math.round(v * 100)}%`;
}

export default function LocationDetail({ location }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {location.centre_name}
            </h2>
            <p className="text-sm text-slate-500">
              {location.planning_area} · Postal prefix {location.postal_prefix}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-sm font-semibold ${tierColor(location.tier)}`}
          >
            {location.tier} · {location.viability_score}/100
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <InfoBlock label="Median AMR rent" value={`S$${location.median_amr_sgd}`} />
        <InfoBlock
          label="Est. monthly rent"
          value={`S$${location.estimated_monthly_rent_sgd}`}
        />
        <InfoBlock
          label="Nearest MRT"
          value={`${location.nearest_mrt} (${location.mrt_distance_km} km)`}
        />
        <InfoBlock
          label="Competition density"
          value={`${location.competition_density} licensed F&B nearby`}
        />
        <InfoBlock
          label="Stall capacity"
          value={`~${location.stall_count_estimate} stalls`}
        />
        <InfoBlock label="Avg hygiene score" value={pct(location.avg_grade_score)} />
      </div>

      <div className="border-t border-slate-100 px-6 py-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Score breakdown
        </h3>
        <div className="space-y-3">
          {METRICS.map(({ key, label, format }) => {
            const val = location[key] as number;
            return (
              <div key={key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-700">{label}</span>
                  <span className="font-medium text-slate-900">
                    {format(val)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${val * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-600">
        <strong>Monetization tier:</strong> Starter plan (S$29/mo) includes 10
        reports; Pro (S$99/mo) adds API access and batch scoring.{" "}
        <a href="/api/locations" className="text-orange-600 hover:underline">
          View API
        </a>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
