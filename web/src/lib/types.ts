export interface LocationScore {
  centre_name: string;
  planning_area: string;
  postal_prefix: string;
  median_amr_sgd: number;
  stall_count_estimate: number;
  nearest_mrt: string;
  mrt_distance_km: number;
  competitor_count: number;
  avg_grade_score: number;
  foot_traffic_score: number;
  competition_gap_score: number;
  rent_affordability_score: number;
  hygiene_score: number;
  density_score: number;
  viability_score: number;
  tier: string;
  estimated_monthly_rent_sgd: number;
  competition_density: number;
}

export function tierColor(tier: string): string {
  switch (tier) {
    case "Excellent":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Good":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "Moderate":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-rose-100 text-rose-800 border-rose-200";
  }
}

export function scoreBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-sky-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}
