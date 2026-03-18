"use client";

import { useCallback, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { subDays } from "date-fns";

interface ChartPoint {
  time: string;
  label: string;
  actual?: number;
  forecast?: number;
}

function toLocalISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

function defaultStart(): string {
  const d = subDays(new Date(), 7);
  d.setHours(0, 0, 0, 0);
  return toLocalISO(d);
}

function defaultEnd(): string {
  const d = new Date();
  d.setHours(23, 30, 0, 0);
  return toLocalISO(d);
}

export default function Home() {
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [horizon, setHorizon] = useState(4);
  const [series, setSeries] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChart = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const start = new Date(startTime).toISOString();
      const end = new Date(endTime).toISOString();
      const res = await fetch(
        `/api/chart?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&horizon=${horizon}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to load chart data");
        setSeries([]);
        return;
      }
      setSeries(data.series ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, [startTime, endTime, horizon]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            UK Wind Power Forecast Monitoring
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Actual vs forecasted national wind generation (data from Jan 2025)
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">Time range & forecast horizon</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="start" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Start time
              </label>
              <input
                id="start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                step="1800"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label htmlFor="end" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
                End time
              </label>
              <input
                id="end"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                step="1800"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
                Forecast horizon: {horizon} hours
              </label>
              <input
                type="range"
                min={0}
                max={48}
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="mt-2 w-full accent-blue-600"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Show latest forecast published at least this many hours before each target time (0–48h)
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadChart}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load chart"}
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            {error}
          </div>
        )}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">Actual vs forecasted generation (MW)</h2>
          {series.length === 0 && !loading && !error && (
            <p className="py-8 text-center text-slate-500 dark:text-slate-400">
              Set dates and click “Load chart” to view data.
            </p>
          )}
          {series.length > 0 && (
            <div className="h-[320px] w-full sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={series}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => {
                      try {
                        const [d, time] = String(v).split(" ");
                        return time ?? d ?? v;
                      } catch {
                        return v;
                      }
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${v} MW`}
                    label={{ value: "MW", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length || !label) return null;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                          <div className="mb-1 font-medium">{label}</div>
                          {payload.map((p) => (
                            <div key={p.dataKey} className="text-sm" style={{ color: p.color }}>
                              {p.name}: {typeof p.value === "number" ? `${p.value} MW` : "—"}
                            </div>
                          ))}
                        </div>
                      );
                    }}
                    formatter={(value: number) => [`${value} MW`, undefined]}
                  />
                  <Legend
                    formatter={(value) => (value === "actual" ? "Actual generation" : "Forecasted generation")}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="actual"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="forecast"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Data: Elexon BMRS (FUELHH, WINDFOR). Forecast horizon 0–48h; only points with valid data are shown.
        </footer>
      </div>
    </div>
  );
}
