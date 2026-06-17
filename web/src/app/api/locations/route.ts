import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import type { LocationScore } from "@/lib/types";

async function loadScores(): Promise<LocationScore[]> {
  const filePath = path.join(process.cwd(), "public/data/location_scores.json");
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as LocationScore[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area")?.toLowerCase();
  const minScore = searchParams.get("min_score");
  const q = searchParams.get("q")?.toLowerCase();

  let scores = await loadScores();

  if (area) {
    scores = scores.filter((s) =>
      s.planning_area.toLowerCase().includes(area)
    );
  }
  if (minScore) {
    const min = parseFloat(minScore);
    if (!isNaN(min)) {
      scores = scores.filter((s) => s.viability_score >= min);
    }
  }
  if (q) {
    scores = scores.filter(
      (s) =>
        s.centre_name.toLowerCase().includes(q) ||
        s.planning_area.toLowerCase().includes(q) ||
        s.nearest_mrt.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    count: scores.length,
    data: scores,
  });
}
