import { NextRequest, NextResponse } from "next/server";
import { fetchForecasts } from "@/lib/bmrs";
import { toForecastPoints } from "@/lib/chart";

export const runtime    = "nodejs";
export const maxDuration = 55;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const start   = searchParams.get("start");
  const end     = searchParams.get("end");
  const horizon = parseFloat(searchParams.get("horizon") ?? "4");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end query params are required" },
      { status: 400 }
    );
  }

  const fetchStart = new Date(
    new Date(start).getTime() - 48 * 60 * 60 * 1000
  ).toISOString();

  try {
    const raw    = await fetchForecasts(fetchStart, end);
    const points = toForecastPoints(
      raw,
      new Date(start),
      new Date(end),
      horizon
    );
    return NextResponse.json(points);
  } catch (err) {
    console.error("[/api/forecast]", err);
    return NextResponse.json(
      { error: "Failed to fetch forecasts from Elexon" },
      { status: 502 }
    );
  }
}