import { createClient } from "@supabase/supabase-js";
import { assertSupabaseConfigured, getSupabaseUrl } from "./config";
import { ConfigurationError } from "@/domain/shared/errors";

export function createAdminClient() {
  assertSupabaseConfigured();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key || key.includes("your_service_role")) {
    throw new ConfigurationError("SUPABASE_SERVICE_ROLE_KEY is required for admin operations.");
  }

  return createClient(getSupabaseUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
