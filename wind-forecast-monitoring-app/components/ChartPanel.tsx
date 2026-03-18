"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { ChartRow } from "@/lib/types";

interface Props {
  rows: ChartRow[];
  loading: boolean;
  horizonHours: number;
}

interface TooltipPayloadItem {
  dataKey?: string;
  value?: number;
  payload?: ChartRow & { fhHours?: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null;

  let displayTime = label;
  try {
    displayTime = format(parseISO(label), "dd MMM yyyy  HH:mm");
  } catch {}

  const actual = payload.find(
    (p: TooltipPayloadItem) => p.dataKey === "actual",
  );
  const forecast = payload.find(
    (p: TooltipPayloadItem) => p.dataKey === "forecast",
  );
  const err =
    actual?.value != null && forecast?.value != null
      ? forecast.value - actual.value
      : null;

  return (
    <div className="bg-[#1c2333] border border-gray-700 rounded-xl p-3 text-sm shadow-2xl min-w-[200px]">
      <p className="font-semibold text-gray-300 mb-2">{displayTime}</p>

      {actual && (
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            Actual
          </span>
          <span className="font-bold text-white">
            {actual.value?.toLocaleString("en-GB")} MW
          </span>
        </div>
      )}

      {forecast && (
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Forecast
          </span>
          <span className="font-bold text-white">
            {forecast.value?.toLocaleString("en-GB")} MW
          </span>
        </div>
      )}

      {err !== null && (
        <div
          className={`mt-2 pt-2 border-t border-gray-700 text-xs font-semibold
            ${err > 0 ? "text-emerald-400" : "text-red-400"}`}
        >
          Error: {err > 0 ? "+" : ""}
          {err.toFixed(0)} MW ({err > 0 ? "over" : "under"}-forecast)
        </div>
      )}

      {payload[0]?.payload?.fhHours != null && (
        <p className="text-[10px] text-gray-500 mt-1">
          Forecast horizon: {payload[0].payload.fhHours.toFixed(1)}h
        </p>
      )}
    </div>
  );
}

function fmtXAxis(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM HH:mm");
  } catch {
    return iso;
  }
}

function fmtYAxis(v: number): string {
  return `${(v / 1000).toFixed(1)}k`;
}

export default function ChartPanel({ rows, loading, horizonHours }: Props) {
  if (loading) {
    return (
      <div
        className="w-full h-[400px] sm:h-[480px] bg-[#161b22]
                      border border-gray-800 rounded-2xl
                      flex items-center justify-center animate-pulse"
      >
        <p className="text-gray-600 text-sm">Fetching data from Elexon…</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        className="w-full h-[400px] sm:h-[480px] bg-[#161b22]
                      border border-gray-800 rounded-2xl
                      flex flex-col items-center justify-center gap-2"
      >
        <p className="text-gray-400 text-sm font-medium">No data to display</p>
        <p className="text-gray-600 text-xs">
          Adjust the date range or horizon and click Update Chart
        </p>
      </div>
    );
  }

  const chartData = rows.map((r) => ({
    ...r,
    actual: r.actual ?? undefined,
    forecast: r.forecast ?? undefined,
  }));

  const maxTicks = 8;
  const step = Math.max(1, Math.floor(chartData.length / maxTicks));
  const ticks = chartData
    .filter((_, i) => i % step === 0)
    .map((r) => r.startTime);

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-sm font-semibold text-gray-300">
          Actual vs Forecasted Wind Generation
          <span className="ml-2 text-xs font-normal text-gray-500">
            (≥ {horizonHours}h horizon)
          </span>
        </h2>
        <div className="flex items-center gap-5 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-sky-400 inline-block rounded" />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-6 h-0.5 bg-emerald-400 inline-block rounded"
              style={{ borderTop: "2px dashed #34d399" }}
            />
            Forecast
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2937"
            vertical={false}
          />

          <XAxis
            dataKey="startTime"
            ticks={ticks}
            tickFormatter={fmtXAxis}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={{ stroke: "#374151" }}
            tickLine={false}
            dy={6}
          />

          <YAxis
            tickFormatter={fmtYAxis}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            label={{
              value: "MW",
              angle: -90,
              position: "insideLeft",
              fill: "#4b5563",
              fontSize: 11,
              dx: -4,
            }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#374151", strokeWidth: 1 }}
          />

          <Legend wrapperStyle={{ display: "none" }} />

          <Line
            type="monotone"
            dataKey="actual"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#38bdf8", strokeWidth: 0 }}
            connectNulls={false}
            name="Actual"
          />

          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#34d399"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4, fill: "#34d399", strokeWidth: 0 }}
            connectNulls={false}
            name="Forecast"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
