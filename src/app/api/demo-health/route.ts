import { NextRequest, NextResponse } from "next/server";
import { getDemoHealth, isDemo } from "@/lib/demo-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public liveness probe for the three AI demos on /ai-tools, for an external
 * monitor that is not on the tailnet.
 *
 * GET /api/demo-health?demo=podcast|chatbot|image
 *   200 {"demo":"podcast","ok":true}
 *   503 {"demo":"podcast","ok":false}
 *   400 {"error":"unknown demo"}
 *
 * The body is deliberately just the demo name and a boolean. A monitor
 * publishes failure text on a public status page, so no host, address, port or
 * upstream error may appear here. The unknown-demo case does not echo the
 * supplied value back either. Nothing is logged for the same reason: the
 * useful detail is exactly the detail that must not leak.
 *
 * no-store because the answer is a point-in-time liveness reading. The
 * throttling that protects the backends lives in getDemoHealth's memo, not in
 * an HTTP cache that a monitor might ignore.
 */
export async function GET(req: NextRequest) {
  const demo = req.nextUrl.searchParams.get("demo");

  if (!isDemo(demo)) {
    return NextResponse.json(
      { error: "unknown demo" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const ok = await getDemoHealth(demo);

  return NextResponse.json(
    { demo, ok },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
