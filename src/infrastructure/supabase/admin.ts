import { createClient } from "@supabase/supabase-js";
import { assertSupabaseConfigured } from "./config";
import { ConfigurationError } from "@/domain/shared/errors";

export function createAdminClient() {
  assertSupabaseConfigured();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key.includes("your_service_role")) {
    throw new ConfigurationError("SUPABASE_SERVICE_ROLE_KEY is required for admin operations.");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
