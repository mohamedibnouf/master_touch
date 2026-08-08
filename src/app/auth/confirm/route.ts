import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/infrastructure/supabase/config";
import { logger } from "@/infrastructure/logging/logger";

const ALLOWED_OTP_TYPES: readonly EmailOtpType[] = [
  "invite",
  "signup",
  "email",
  "recovery",
  "magiclink",
  "email_change",
] as const;

function isEmailOtpType(value: string): value is EmailOtpType {
  return (ALLOWED_OTP_TYPES as readonly string[]).includes(value);
}

/** Only relative locale auth/app paths — never open redirects. */
function safePostVerifyPath(next: string | null, type: EmailOtpType): string {
  const fallback =
    type === "invite" || type === "recovery" ? "/ar/reset-password" : "/ar/login";

  if (!next) return fallback;

  let path = next.trim();
  if (!path.startsWith("/")) {
    try {
      const parsed = new URL(path);
      path = `${parsed.pathname}${parsed.search}`;
    } catch {
      return fallback;
    }
  }

  if (
    path.includes("://") ||
    path.includes("//") ||
    path.includes("\\") ||
    path.includes("..") ||
    !/^\/(ar|en)(\/|$)/.test(path)
  ) {
    return fallback;
  }

  return path;
}

/**
 * Custom-domain Auth confirmation for invite / recovery / email links.
 * Email templates must use TokenHash (not ConfirmationURL) so the link hits this route:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash")?.trim() ?? "";
  const typeRaw = searchParams.get("type")?.trim() ?? "";
  const nextRaw = searchParams.get("next");

  const fail = (reason: string) => {
    logger.warn("auth.confirm failed", { reason, type: typeRaw || null });
    const url = request.nextUrl.clone();
    url.pathname = "/ar/login";
    url.search = "";
    url.searchParams.set("error", "auth_link_invalid");
    return NextResponse.redirect(url);
  };

  if (!token_hash || !typeRaw || !isEmailOtpType(typeRaw)) {
    return fail("missing_or_invalid_params");
  }

  const type = typeRaw;
  const destinationPath = safePostVerifyPath(nextRaw, type);

  let response = NextResponse.redirect(new URL(destinationPath, request.url));

  try {
    const url = getSupabaseUrl();
    const anon = getSupabaseAnonKey();
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.redirect(new URL(destinationPath, request.url));
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) {
      return fail(error.message || "verify_otp_failed");
    }

    return response;
  } catch (error) {
    logger.error("auth.confirm unexpected error", { error });
    return fail("unexpected");
  }
}
