import { ConfigurationError } from "@/domain/shared/errors";

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Project root URL only — strips accidental `/rest/v1` suffixes and whitespace. */
export function getSupabaseUrl(): string {
  const raw = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!raw) {
    throw new ConfigurationError(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }
  return raw.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

export function getSupabaseAnonKey(): string {
  const anon = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!anon) {
    throw new ConfigurationError(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }
  return anon;
}

export function assertSupabaseConfigured(): void {
  const url = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anon = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const service = trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

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
  if (!trimEnv(process.env.UPSTASH_REDIS_REST_URL) || !trimEnv(process.env.UPSTASH_REDIS_REST_TOKEN)) {
    throw new ConfigurationError(
      "Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }
}
