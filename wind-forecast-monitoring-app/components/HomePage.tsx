"use client";

import { useState, useCallback, useEffect } from "react";
import { addHours, formatISO } from "date-fns";
import type { ChartApiResponse } from "@/lib/types";
import { Wind, RefreshCw, AlertCircle } from "lucide-react";
import ChartPanel from "@/components/ChartPanel";
import DateRangePicker from "@/components/DateRangePicker";
import HorizonSlider from "@/components/HorizonSlider";
import MetricsBar from "@/components/MetricsBar";

const MIN_ALLOWED = new Date("2025-01-01T00:00:00Z");

interface HomePageProps {
  initialEndIso: string;
  initialStartIso: string;
}

export default function HomePage({
  initialEndIso,
  initialStartIso,
}: HomePageProps) {
  const [startDate, setStartDate] = useState<Date>(
    () => new Date(initialStartIso),
  );
  const [endDate, setEndDate] = useState<Date>(() => new Date(initialEndIso));
  const [horizon, setHorizon] = useState<number>(4);

  const [data, setData] = useState<ChartApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const effectiveStart = startDate < MIN_ALLOWED ? MIN_ALLOWED : startDate;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        start: formatISO(effectiveStart),
        end: formatISO(endDate),
        horizon: horizon.toString(),
      });

      const res = await fetch(`/api/chart?${params}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const json: ChartApiResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, horizon]);

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartChange = (d: Date) => {
    setStartDate(d);
    if (d > endDate) setEndDate(addHours(d, 24));
  };

  const handleEndChange = (d: Date) => {
    if (d > startDate) setEndDate(d);
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <header className="border-b border-gray-800 bg-[#161b22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Wind className="text-sky-400 shrink-0" size={26} />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">
              UK Wind Power Forecast Monitor
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              Actual vs Forecasted national wind generation · Elexon BMRS
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <DateRangePicker
              label="Start Time"
              value={startDate}
              onChange={handleStartChange}
              min={MIN_ALLOWED}
              max={endDate}
            />

            <DateRangePicker
              label="End Time"
              value={endDate}
              onChange={handleEndChange}
              min={startDate}
            />

            <div className="lg:col-span-1">
              <HorizonSlider value={horizon} onChange={setHorizon} />
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              suppressHydrationWarning
              className="
                flex items-center justify-center gap-2
                bg-sky-500 hover:bg-sky-400 disabled:bg-sky-800
                disabled:cursor-not-allowed
                text-white font-semibold text-sm
                px-6 py-2.5 rounded-xl
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
                focus:ring-offset-[#161b22]
              "
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading…" : "Update Chart"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-950 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>
              <strong>Error:</strong> {error}. Try a shorter date range or
              reload the page.
            </span>
          </div>
        )}

        <MetricsBar metrics={data?.metrics ?? null} loading={loading} />

        <ChartPanel
          rows={data?.rows ?? []}
          loading={loading}
          horizonHours={horizon}
        />

        {data && !loading && (
          <p className="text-xs text-gray-500 text-center">
            Showing the latest forecast created at least{" "}
            <strong className="text-gray-400">{horizon}h</strong> before each
            target time · Horizon range 0–48 h · Data from Jan 2025
          </p>
        )}
      </main>
    </div>
  );
}
