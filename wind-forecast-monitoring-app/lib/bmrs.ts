import type { ActualPoint, ForecastPoint } from "./types";

const BMRS_BASE = process.env.BMRS_API_BASE ?? "https://data.elexon.co.uk/bmrs/api/v1";

type DatasetId = "FUELHH" | "WINDFOR";

interface BmrsDatasetResponse<T extends object> {
  data: T[];
}

interface FuelHhRow {
  startTime: string;
  publishTime: string;
  fuelType: string;
  generation: number;
}

interface WindForRow {
  startTime: string;
  publishTime: string;
  generation: number;
}

function isDatasetResponse<T extends object>(
  value: T[] | BmrsDatasetResponse<T>
): value is BmrsDatasetResponse<T> {
  return !Array.isArray(value) && Array.isArray((value as BmrsDatasetResponse<T>).data);
}

function toMs(iso: string): number {
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : NaN;
}

function filterByStartTimeRange<T extends { startTime: string }>(rows: T[], fromIso: string, toIso: string): T[] {
  const fromMs = toMs(fromIso);
  const toMsVal = toMs(toIso);
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMsVal)) return rows;
  return rows.filter((r) => {
    const t = toMs(r.startTime);
    return Number.isFinite(t) && t >= fromMs && t <= toMsVal;
  });
}

async function fetchDataset<T extends object>(
  dataset: DatasetId,
  params: Record<string, string>,
  revalidateSeconds = 300
): Promise<T[]> {
  const url = new URL(`${BMRS_BASE}/datasets/${dataset}`);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { next: { revalidate: revalidateSeconds } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${dataset} request failed (${res.status}): ${body.slice(0, 500)}`);
  }

  const payload = (await res.json()) as T[] | BmrsDatasetResponse<T>;
  return isDatasetResponse(payload) ? payload.data : payload;
}

export async function fetchFuelHH(fromIso: string, toIso: string): Promise<ActualPoint[]> {
  const rows = await fetchDataset<FuelHhRow>("FUELHH", { from: fromIso, to: toIso });
  const filtered = filterByStartTimeRange(rows, fromIso, toIso);
  return filtered
    .filter((r) => r.fuelType === "WIND")
    .map((r) => ({ startTime: r.startTime, generation: Number(r.generation) || 0 }))
    .filter((p) => p.startTime);
}

export async function fetchWindFor(fromIso: string, toIso: string): Promise<ForecastPoint[]> {
  const rows = await fetchDataset<WindForRow>("WINDFOR", { from: fromIso, to: toIso });
  const filtered = filterByStartTimeRange(rows, fromIso, toIso);
  return filtered
    .map((r) => ({
      startTime: r.startTime,
      publishTime: r.publishTime,
      generation: Number(r.generation) || 0,
    }))
    .filter((p) => p.startTime && p.publishTime);
}
