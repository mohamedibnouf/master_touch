import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey } from "@/infrastructure/supabase/config";

export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "fail" | "skip";

export async function GET() {
  const checks: {
    database: CheckStatus;
    redis: CheckStatus;
  } = {
    database: "fail",
    redis: "fail",
  };

  if (isSupabaseConfigured()) {
    try {
      const sb = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await sb.from("site_settings").select("id").limit(1);
      checks.database = error ? "fail" : "ok";
    } catch {
      checks.database = "fail";
    }
  }

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    try {
      const client = new Redis({ url, token });
      const pong = await client.ping();
      checks.redis = pong ? "ok" : "fail";
    } catch {
      checks.redis = "fail";
    }
  } else {
    checks.redis = "skip";
  }

  const healthy =
    checks.database === "ok" && (checks.redis === "ok" || checks.redis === "skip");

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
