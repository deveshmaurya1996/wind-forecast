
import type {
  ActualPoint,
  ChartMetrics,
  ChartRow,
  ElexonActualRecord,
  ElexonForecastRecord,
  ForecastPoint,
} from "@/lib/types";

const MIN_DATE = new Date("2025-01-01T00:00:00Z");

export function toActualPoints(raw: ElexonActualRecord[]): ActualPoint[] {
  return raw
    .filter((r) => new Date(r.startTime) >= MIN_DATE)
    .map((r) => ({ startTime: r.startTime, generation: r.generation }));
}

export function toForecastPoints(
  raw: ElexonForecastRecord[],
  displayStart: Date,
  displayEnd: Date,
  horizonHours: number
): ForecastPoint[] {
  const points: ForecastPoint[] = [];

  for (const r of raw) {
    const targetTime  = new Date(r.startTime);
    const publishTime = new Date(r.publishTime);

    if (targetTime < displayStart || targetTime > displayEnd) continue;
    if (targetTime < MIN_DATE) continue;

    const fhHours =
      (targetTime.getTime() - publishTime.getTime()) / (1000 * 60 * 60);

    if (fhHours < 0 || fhHours > 48) continue;
    if (fhHours < horizonHours) continue;

    points.push({
      startTime:   r.startTime,
      publishTime: r.publishTime,
      generation:  r.generation,
      fhHours,
    });
  }

  return points;
}

export function buildChartRows(
  actuals: ActualPoint[],
  rawForecasts: ElexonForecastRecord[],
  displayStart: Date,
  displayEnd: Date,
  horizonHours: number
): ChartRow[] {
  const actualsMap = new Map<string, number>();
  for (const a of actuals) {
    actualsMap.set(normaliseISO(a.startTime), a.generation);
  }

  const forecastsByTarget = new Map<string, ForecastPoint[]>();

  for (const r of rawForecasts) {
    const targetTime  = new Date(r.startTime);
    const publishTime = new Date(r.publishTime);

    if (targetTime < displayStart || targetTime > displayEnd) continue;
    if (targetTime < MIN_DATE) continue;

    const fhHours =
      (targetTime.getTime() - publishTime.getTime()) / (1000 * 60 * 60);

    if (fhHours < 0 || fhHours > 48) continue;
    if (fhHours < horizonHours) continue;

    const key = normaliseISO(r.startTime);
    const arr = forecastsByTarget.get(key) ?? [];
    arr.push({
      startTime:   r.startTime,
      publishTime: r.publishTime,
      generation:  r.generation,
      fhHours,
    });
    forecastsByTarget.set(key, arr);
  }

  const bestForecastMap = new Map<string, ForecastPoint>();
  for (const [key, candidates] of forecastsByTarget) {
    const best = candidates.reduce((prev, curr) =>
      curr.publishTime > prev.publishTime ? curr : prev
    );
    bestForecastMap.set(key, best);
  }

  const allTimes = new Set<string>([
    ...actualsMap.keys(),
    ...bestForecastMap.keys(),
  ]);

  const rows: ChartRow[] = [...allTimes]
    .sort()
    .map((t) => {
      const fp = bestForecastMap.get(t);
      return {
        startTime: t,
        actual:    actualsMap.get(t)   ?? null,
        forecast:  fp?.generation      ?? null,
        fhHours:   fp?.fhHours,
      };
    });

  return rows;
}

export function computeMetrics(rows: ChartRow[]): ChartMetrics {
  const paired = rows.filter(
    (r) => r.actual != null && r.forecast != null
  ) as Array<ChartRow & { actual: number; forecast: number }>;

  if (paired.length === 0) {
    return { mae: null, rmse: null, mape: null, bias: null, count: 0 };
  }

  const n = paired.length;
  let sumAbsErr = 0;
  let sumSqErr  = 0;
  let sumErr    = 0;
  let sumAbsPct = 0;
  let mapeCount = 0;

  for (const { actual, forecast } of paired) {
    const err = forecast - actual;
    sumAbsErr += Math.abs(err);
    sumSqErr  += err * err;
    sumErr    += err;
    if (actual !== 0) {
      sumAbsPct += Math.abs(err / actual);
      mapeCount++;
    }
  }

  return {
    mae:   round2(sumAbsErr / n),
    rmse:  round2(Math.sqrt(sumSqErr / n)),
    mape:  mapeCount > 0 ? round2((sumAbsPct / mapeCount) * 100) : null,
    bias:  round2(sumErr / n),
    count: n,
  };
}

function normaliseISO(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 19) + "Z";
  } catch {
    return iso;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}