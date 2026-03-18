"use client";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function HorizonSlider({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Forecast Horizon (min)
        </label>
        <span className="text-sm font-bold text-sky-400">{value} h</span>
      </div>

      <input
        type="range"
        min={0}
        max={48}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="
          w-full h-2 rounded-full appearance-none cursor-pointer
          bg-gray-700
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-sky-400
          [&::-webkit-slider-thumb]:border-0
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-grab
          [&::-webkit-slider-thumb]:active:cursor-grabbing
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-sky-400
          [&::-moz-range-thumb]:border-0
        "
        style={{
          background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${
            (value / 48) * 100
          }%, #374151 ${(value / 48) * 100}%, #374151 100%)`,
        }}
      />

      <div className="flex justify-between text-xs text-gray-600">
        <span>0 h</span>
        <span>12 h</span>
        <span>24 h</span>
        <span>36 h</span>
        <span>48 h</span>
      </div>
    </div>
  );
}
