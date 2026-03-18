import type { ActualPoint, ForecastPoint, ChartPoint } from "./types";

const JAN_2025 = new Date("2025-01-01T00:00:00Z").getTime();
const HOUR_MS = 60 * 60 * 1000;

function parseTime(s: string): number {
  const d = new Date(s);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function formatLabel(ms: number): string {
  const d = new Date(ms);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = String(d.getUTCFullYear()).slice(-2);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${h}:${m}`;
}

export function buildChartSeries(
  actuals: ActualPoint[],
  forecasts: ForecastPoint[],
  horizonHours: number
): ChartPoint[] {
  const actualByTime = new Map<number, number>();
  for (const a of actuals) {
    const t = parseTime(a.startTime);
    if (t >= JAN_2025) actualByTime.set(t, a.generation);
  }

  const horizonMsMin = 0;
  const horizonMsMax = 48 * HOUR_MS;
  const validForecasts = forecasts.filter((f) => {
    const startMs = parseTime(f.startTime);
    const publishMs = parseTime(f.publishTime);
    if (startMs < JAN_2025 || publishMs < JAN_2025) return false;
    const horizonMs = startMs - publishMs;
    return horizonMs >= horizonMsMin && horizonMs <= horizonMsMax;
  });

  const cutoffMs = horizonHours * HOUR_MS;
  const forecastByTarget = new Map<number, { publishMs: number; generation: number }>();

  for (const f of validForecasts) {
    const startMs = parseTime(f.startTime);
    const publishMs = parseTime(f.publishTime);
    if (startMs - publishMs < cutoffMs) continue;
    const existing = forecastByTarget.get(startMs);
    if (!existing || publishMs > existing.publishMs) {
      forecastByTarget.set(startMs, { publishMs, generation: f.generation });
    }
  }

  const targetTimes = new Set<number>();
  forecastByTarget.forEach((_, t) => targetTimes.add(t));
  for (const t of actualByTime.keys()) {
    targetTimes.add(t);
  }

  const sorted = Array.from(targetTimes).sort((a, b) => a - b);
  const series: ChartPoint[] = sorted.map((t) => {
    const startStr = new Date(t).toISOString();
    const actual = actualByTime.get(t);
    const fc = forecastByTarget.get(t);
    return {
      time: startStr,
      label: formatLabel(t),
      ...(actual !== undefined && { actual }),
      ...(fc !== undefined && { forecast: fc.generation }),
    };
  });

  return series;
}
