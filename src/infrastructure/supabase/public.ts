import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertSupabaseConfigured, getSupabaseAnonKey, getSupabaseUrl } from "./config";

/**
 * Cookie-free anon client for public cached reads (unstable_cache).
 * Do not use for authenticated user-scoped operations.
 */
export function createPublicClient(): SupabaseClient {
  assertSupabaseConfigured();
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
