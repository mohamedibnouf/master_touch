import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { assertSupabaseConfigured, getSupabaseAnonKey, getSupabaseUrl } from "./config";
import { AuthenticationError, DatabaseError } from "@/domain/shared/errors";
import type { User, SupabaseClient } from "@supabase/supabase-js";

export async function createClient() {
  assertSupabaseConfigured();
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component context — session refresh handled in middleware.
          }
        },
      },
    },
  );
}

export async function requireAuthUser(): Promise<{
  supabase: SupabaseClient;
  user: User;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw new DatabaseError(error.message, error);
  if (!user) throw new AuthenticationError();
  return { supabase, user };
}
