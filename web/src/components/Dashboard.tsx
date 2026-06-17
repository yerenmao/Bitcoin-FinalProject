"use client";

import { useMemo, useState } from "react";
import type { LocationScore } from "@/lib/types";
import { scoreBarColor, tierColor } from "@/lib/types";
import LocationDetail from "./LocationDetail";

interface Props {
  locations: LocationScore[];
}

export default function Dashboard({ locations }: Props) {
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [selected, setSelected] = useState<LocationScore | null>(
    locations[0] ?? null
  );

  const areas = useMemo(
    () => [...new Set(locations.map((l) => l.planning_area))].sort(),
    [locations]
  );

  const filtered = useMemo(() => {
    return locations.filter((l) => {
      const matchesQuery =
        !query ||
        l.centre_name.toLowerCase().includes(query.toLowerCase()) ||
        l.nearest_mrt.toLowerCase().includes(query.toLowerCase());
      const matchesArea =
        areaFilter === "all" || l.planning_area === areaFilter;
      return matchesQuery && matchesArea;
    });
  }, [locations, query, areaFilter]);

  const avgScore =
    locations.reduce((s, l) => s + l.viability_score, 0) / locations.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
          Singapore F&B Location Intelligence
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          StallPulse
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-800">
          Data-driven hawker centre viability scores for aspiring stall
          operators. Aggregates NEA licensing data, MRT proximity, and rent
          benchmarks.
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Centres tracked" value={String(locations.length)} />
        <StatCard label="Avg viability score" value={avgScore.toFixed(1)} />
        <StatCard
          label="Top location"
          value={locations[0]?.centre_name.split(" ")[0] ?? "—"}
          sub={`Score ${locations[0]?.viability_score ?? "—"}`}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search centre or MRT..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-orange-400 focus:outline-none"
        >
          <option value="all">All planning areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="font-semibold text-slate-800">
                Ranked locations ({filtered.length})
              </h2>
            </div>
            <ul className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
              {filtered.map((loc) => (
                <li key={loc.centre_name}>
                  <button
                    type="button"
                    onClick={() => setSelected(loc)}
                    className={`w-full px-4 py-3 text-left transition hover:bg-orange-50 ${
                      selected?.centre_name === loc.centre_name
                        ? "bg-orange-50 border-l-4 border-orange-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          {loc.centre_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {loc.planning_area} · {loc.nearest_mrt} (
                          {loc.mrt_distance_km} km)
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${tierColor(loc.tier)}`}
                      >
                        {loc.viability_score}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${scoreBarColor(loc.viability_score)}`}
                        style={{ width: `${loc.viability_score}%` }}
                      />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <LocationDetail location={selected} />
          ) : (
            <p className="text-slate-500">Select a location to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
