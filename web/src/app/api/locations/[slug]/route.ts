import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import type { LocationScore } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const name = decodeURIComponent(slug).replace(/-/g, " ");

  const filePath = path.join(process.cwd(), "public/data/location_scores.json");
  const raw = await readFile(filePath, "utf-8");
  const scores = JSON.parse(raw) as LocationScore[];

  const match = scores.find(
    (s) => s.centre_name.toLowerCase() === name.toLowerCase()
  );

  if (!match) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}
