import { NextResponse } from "next/server";
import { fetchFuelHH } from "@/lib/bmrs";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json(
      { error: "Query params 'from' and 'to' (ISO dates) required" },
      { status: 400 }
    );
  }
  try {
    const data = await fetchFuelHH(from, to);
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch actuals";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
