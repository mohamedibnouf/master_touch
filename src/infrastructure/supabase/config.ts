import { ConfigurationError } from "@/domain/shared/errors";

export function assertSupabaseConfigured(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !url ||
    !anon ||
    url.includes("YOUR_PROJECT_REF") ||
    anon.includes("your_anon_key")
  ) {
    throw new ConfigurationError(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  // Service role is required for admin mutations / storage; warn at assert time for server ops
  void service;
}

export function isSupabaseConfigured(): boolean {
  try {
    assertSupabaseConfigured();
    return true;
  } catch {
    return false;
  }
}

export function assertUpstashConfigured(): void {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new ConfigurationError(
      "Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }
}
