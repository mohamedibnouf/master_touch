import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/infrastructure/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "fail" | "skip"> = {
    supabase: "fail",
    upstash: "fail",
    sentry: process.env.SENTRY_DSN ? "ok" : "skip",
  };

  try {
    checks.supabase = isSupabaseConfigured() ? "ok" : "fail";
  } catch {
    checks.supabase = "fail";
  }

  checks.upstash =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? "ok" : "fail";

  const healthy = checks.supabase === "ok" && checks.upstash === "ok";

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version ?? "0.1.0",
    },
    { status: healthy ? 200 : 503 },
  );
}
