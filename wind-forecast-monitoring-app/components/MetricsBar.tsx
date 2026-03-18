"use client";

import type { ChartMetrics } from "@/lib/types";

interface Props {
  metrics: ChartMetrics | null;
  loading: boolean;
}

interface StatProps {
  label: string;
  value: string | null;
  color: string;
  title?: string;
}

function Stat({ label, value, color, title }: StatProps) {
  return (
    <div
      title={title}
      className="flex flex-col items-center justify-center gap-0.5
                 bg-[#0d1117] border border-gray-800 rounded-xl
                 px-4 py-3 min-w-[80px] flex-1"
    >
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
        {label}
      </span>
      <span className={`text-base font-bold ${color}`}>{value ?? "—"}</span>
    </div>
  );
}

export default function MetricsBar({ metrics, loading }: Props) {
  if (loading) {
    return (
      <div className="flex gap-3 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 flex-1 min-w-[80px] bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!metrics || metrics.count === 0) return null;

  const biasColor =
    metrics.bias === null
      ? "text-gray-400"
      : metrics.bias > 0
        ? "text-emerald-400"
        : "text-red-400";

  return (
    <div className="flex gap-3 flex-wrap animate-[fadeIn_0.3s_ease-in-out]">
      <Stat
        label="MAE"
        value={metrics.mae !== null ? `${metrics.mae} MW` : null}
        color="text-amber-400"
        title="Mean Absolute Error"
      />
      <Stat
        label="RMSE"
        value={metrics.rmse !== null ? `${metrics.rmse} MW` : null}
        color="text-orange-400"
        title="Root Mean Square Error"
      />
      <Stat
        label="MAPE"
        value={metrics.mape !== null ? `${metrics.mape}%` : null}
        color="text-rose-400"
        title="Mean Absolute Percentage Error"
      />
      <Stat
        label="Bias"
        value={metrics.bias !== null ? `${metrics.bias} MW` : null}
        color={biasColor}
        title="Mean signed error — positive = over-forecast"
      />
      <Stat
        label="Points"
        value={metrics.count.toString()}
        color="text-gray-300"
        title="Matched actual+forecast pairs"
      />
    </div>
  );
}
