
import { NextRequest, NextResponse } from "next/server";
import { fetchActuals, fetchForecasts } from "@/lib/bmrs";
import {
  buildChartRows,
  computeMetrics,
  toActualPoints,
} from "@/lib/chart";
import type { ChartApiResponse } from "@/lib/types";

export const runtime     = "nodejs";
export const maxDuration = 55;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const start   = searchParams.get("start");
  const end     = searchParams.get("end");
  const horizon = parseFloat(searchParams.get("horizon") ?? "4");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end are required" },
      { status: 400 }
    );
  }

  if (isNaN(horizon) || horizon < 0 || horizon > 48) {
    return NextResponse.json(
      { error: "horizon must be between 0 and 48" },
      { status: 400 }
    );
  }

  const displayStart = new Date(start);
  const displayEnd   = new Date(end);

  const fetchStart = new Date(
    displayStart.getTime() - 48 * 60 * 60 * 1000
  ).toISOString();

  try {
    const [rawActuals, rawForecasts] = await Promise.all([
      fetchActuals(start, end),
      fetchForecasts(fetchStart, end),
    ]);

    const actuals = toActualPoints(rawActuals);
    const rows    = buildChartRows(
      actuals,
      rawForecasts,
      displayStart,
      displayEnd,
      horizon
    );
    const metrics = computeMetrics(rows);

    const response: ChartApiResponse = { rows, metrics };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/chart]", err);
    return NextResponse.json(
      { error: "Failed to fetch data from Elexon" },
      { status: 502 }
    );
  }
} 