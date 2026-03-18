import { NextResponse } from "next/server";
import { fetchFuelHH, fetchWindFor } from "@/lib/bmrs";
import { buildChartSeries } from "@/lib/chart";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const horizon = searchParams.get("horizon");
  if (!start || !end) {
    return NextResponse.json(
      { error: "Query params 'start' and 'end' (ISO dates) required" },
      { status: 400 }
    );
  }
  const horizonHours = Math.min(48, Math.max(0, Number(horizon) || 4));
  try {
    const [actuals, forecasts] = await Promise.all([
      fetchFuelHH(start, end),
      fetchWindFor(start, end),
    ]);
    const series = buildChartSeries(actuals, forecasts, horizonHours);
    return NextResponse.json({ series });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to build chart data";
    return NextResponse.json({ error: message, series: [] }, { status: 502 });
  }
}
