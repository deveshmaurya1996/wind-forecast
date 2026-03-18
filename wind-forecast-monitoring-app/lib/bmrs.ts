
import type { ElexonActualRecord, ElexonForecastRecord } from "@/lib/types";

const BASE = "https://data.elexon.co.uk/bmrs/api/v1";

const FETCH_TIMEOUT_MS = 55_000;

async function fetchNDJSON<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T[]> {
  const url = new URL(`${BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(
      `Elexon ${endpoint} returned ${response.status}: ${await response.text()}`
    );
  }

  const text = await response.text();

  const trimmed = text.trim();

  if (trimmed.startsWith("[")) {
    return JSON.parse(trimmed) as T[];
  }

  const records: T[] = [];
  for (const line of trimmed.split("\n")) {
    const l = line.trim();
    if (!l) continue;
    try {
      records.push(JSON.parse(l) as T);
    } catch {
    }
  }
  return records;
}

export async function fetchActuals(
  start: string,
  end: string
): Promise<ElexonActualRecord[]> {
  const raw = await fetchNDJSON<ElexonActualRecord>("/datasets/FUELHH/stream", {
    from:      start,
    to:        end,
    fuelType:  "WIND",
    format:    "json",
  });

  return raw.filter(
    (r) => r.fuelType === "WIND" && typeof r.generation === "number"
  );
}

export async function fetchForecasts(
  start: string,
  end: string
): Promise<ElexonForecastRecord[]> {
  const raw = await fetchNDJSON<ElexonForecastRecord>(
    "/datasets/WINDFOR/stream",
    {
      from:   start,
      to:     end,
      format: "json",
    }
  );

  return raw.filter(
    (r) =>
      r.startTime &&
      r.publishTime &&
      typeof r.generation === "number"
  );
}