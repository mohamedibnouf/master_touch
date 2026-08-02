"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { loginSchema } from "@/lib/validations";
import { assertRateLimit } from "@/infrastructure/rate-limit/service";
import { toActionError, ValidationError, AuthenticationError } from "@/domain/shared/errors";
import { logger } from "@/infrastructure/logging/logger";
import { writeAuditLog, safeAdminNextPath } from "@/lib/permissions";
import { z } from "zod";
import { createAdminClient } from "@/infrastructure/supabase/admin";

export async function loginAction(input: unknown) {
  try {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid credentials", parsed.error.flatten());

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    await assertRateLimit(`${ip}:${parsed.data.email}`, { name: "login", limit: 10, window: "60 s" });

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error) throw new AuthenticationError(error.message);

    if (data.user) {
      await createAdminClient()
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", data.user.id);
      await writeAuditLog("auth.login", "profiles", data.user.id);
    }

    // Remember-me: extend cookie lifetime via session (Supabase handles refresh tokens)
    if (parsed.data.remember) {
      const jar = await cookies();
      jar.set("mt_remember", "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    redirect(safeAdminNextPath(parsed.data.next));
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error; // next redirect
    logger.error("login failed", { error });
    return toActionError(error);
  }
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    const jar = await cookies();
    jar.delete("mt_remember");
    await writeAuditLog("auth.logout", "profiles");
  } catch (error) {
    logger.error("logout failed", { error });
  }
  redirect("/ar/login");
}

export async function forgotPasswordAction(email: string, locale = "ar") {
  try {
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) throw new ValidationError("Invalid email");

    await assertRateLimit(parsed.data, { name: "forgot", limit: 5, window: "60 s" });

    const supabase = await createClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/${locale}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo });
    if (error) throw new AuthenticationError(error.message);
    await writeAuditLog("auth.forgot_password", "profiles");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function resetPasswordAction(password: string) {
  try {
    const parsed = z.string().min(8).max(128).safeParse(password);
    if (!parsed.success) throw new ValidationError("Password too short");

    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    await assertRateLimit(ip, { name: "reset-password", limit: 8, window: "60 s" });

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    if (error) throw new AuthenticationError(error.message);
    await writeAuditLog("auth.reset_password", "profiles");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}
