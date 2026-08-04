import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey } from "@/infrastructure/supabase/config";

export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "fail" | "skip";

function readBuildId(): string {
  const candidates = [
    join(process.cwd(), ".next", "BUILD_ID"),
    join(process.cwd(), "BUILD_ID"),
  ];
  for (const file of candidates) {
    try {
      if (existsSync(file)) {
        return readFileSync(file, "utf8").trim();
      }
    } catch {
      /* ignore */
    }
  }
  return process.env.NEXT_BUILD_ID?.trim() || "unknown";
}

function readAppVersion(): string {
  try {
    const pkgPath = join(process.cwd(), "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
      if (pkg.version) return pkg.version;
    }
  } catch {
    /* ignore */
  }
  return process.env.npm_package_version ?? "0.1.0";
}

export async function GET() {
  const checks: {
    database: CheckStatus;
    redis: CheckStatus;
    sentry: CheckStatus;
  } = {
    database: "fail",
    redis: "fail",
    sentry: process.env.SENTRY_DSN?.trim() ? "ok" : "skip",
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
  }

  const healthy = checks.database === "ok" && checks.redis === "ok";
  const version = readAppVersion();
  const buildId = readBuildId();
  const uptime = Math.round(process.uptime());

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime,
      uptimeHuman: `${uptime}s`,
      version,
      build: {
        version,
        id: buildId,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV ?? "unknown",
        node: process.version,
        hostname: process.env.HOSTNAME ?? "0.0.0.0",
        port: process.env.PORT ?? "3000",
      },
      checks: {
        database: checks.database,
        redis: checks.redis,
        sentry: checks.sentry,
        supabase: checks.database,
        upstash: checks.redis,
      },
      database: checks.database,
      redis: checks.redis,
    },
    { status: healthy ? 200 : 503 },
  );
}
