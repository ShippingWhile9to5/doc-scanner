import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://zobxwggzguznnsmyssyr.supabase.co/rest/v1/";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(SUPABASE_URL, {
    headers: { "Content-Type": "application/json" },
  });

  return NextResponse.json({
    ok: true,
    pinged: SUPABASE_URL,
    status: res.status,
    ts: new Date().toISOString(),
  });
}
