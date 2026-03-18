import { NextRequest, NextResponse } from "next/server";
import { fetchActuals } from "@/lib/bmrs";
import { toActualPoints } from "@/lib/chart";

export const runtime = "nodejs";
export const maxDuration = 55;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const start = searchParams.get("start");
  const end   = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end query params are required" },
      { status: 400 }
    );
  }

  try {
    const raw    = await fetchActuals(start, end);
    const points = toActualPoints(raw);
    return NextResponse.json(points);
  } catch (err) {
    console.error("[/api/actual]", err);
    return NextResponse.json(
      { error: "Failed to fetch actuals from Elexon" },
      { status: 502 }
    );
  }
}