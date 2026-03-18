"use client";

import { format } from "date-fns";

interface Props {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  min?: Date;
  max?: Date;
}

function toLocalInputValue(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

function toMinMax(d?: Date): string | undefined {
  return d ? toLocalInputValue(d) : undefined;
}

export default function DateRangePicker({
  label,
  value,
  onChange,
  min,
  max,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="datetime-local"
        value={toLocalInputValue(value)}
        suppressHydrationWarning
        min={toMinMax(min)}
        max={toMinMax(max)}
        step={1800}
        onChange={(e) => {
          if (e.target.value) onChange(new Date(e.target.value));
        }}
        className="
          w-full px-3 py-2 rounded-xl text-sm
          bg-[#0d1117] border border-gray-700 text-gray-100
          focus:outline-none focus:ring-2 focus:ring-sky-500
          focus:border-transparent transition-colors
        "
      />
    </div>
  );
}
