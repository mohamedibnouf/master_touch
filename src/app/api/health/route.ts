import { NextResponse } from "next/server";
import { isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey } from "@/infrastructure/supabase/config";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "fail" | "skip"> = {
    supabase: "fail",
    upstash: "fail",
    sentry: process.env.SENTRY_DSN ? "ok" : "skip",
  };

  if (isSupabaseConfigured()) {
    try {
      const sb = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await sb.from("site_settings").select("id").limit(1);
      checks.supabase = error ? "fail" : "ok";
    } catch {
      checks.supabase = "fail";
    }
  }

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      const pong = await redis.ping();
      checks.upstash = pong ? "ok" : "fail";
    } catch {
      checks.upstash = "fail";
    }
  }

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
