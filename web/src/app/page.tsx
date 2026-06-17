import Dashboard from "@/components/Dashboard";
import type { LocationScore } from "@/lib/types";
import { readFile } from "fs/promises";
import path from "path";

async function getLocations(): Promise<LocationScore[]> {
  const filePath = path.join(
    process.cwd(),
    "public/data/location_scores.json"
  );
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as LocationScore[];
}

export default async function Home() {
  const locations = await getLocations();
  return (
    <div className="min-h-screen bg-slate-50">
      <Dashboard locations={locations} />
    </div>
  );
}
