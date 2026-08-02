import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./src/lib/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

function hasAdminCapability(keys: string[] | null | undefined): boolean {
  if (!keys?.length) return false;
  if (keys.includes("*")) return true;
  const needed = [
    "dashboard.view",
    "homepage.view",
    "about.view",
    "services.view",
    "contact.view",
    "media.view",
    "theme.view",
    "settings.view",
    "translations.view",
    "users.view",
    "roles.view",
  ];
  return needed.some((k) => keys.includes(k) || keys.includes(k.replace(/\.view$/, ".manage")));
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) {
    let response = NextResponse.next({ request });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!url || !anon || url.includes("YOUR_PROJECT_REF")) {
      if (pathname.startsWith("/api/health")) {
        return NextResponse.json({ status: "misconfigured" }, { status: 503 });
      }
      const login = request.nextUrl.clone();
      login.pathname = `/${defaultLocale}/login`;
      login.searchParams.set("error", "config");
      return NextResponse.redirect(login);
    }

    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (pathname.startsWith("/admin")) {
      if (!user) {
        const login = request.nextUrl.clone();
        login.pathname = `/${defaultLocale}/login`;
        login.searchParams.set("next", pathname.startsWith("/admin") ? pathname : "/admin");
        return NextResponse.redirect(login);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && profile.is_active === false) {
        const login = request.nextUrl.clone();
        login.pathname = `/${defaultLocale}/login`;
        login.searchParams.set("error", "inactive");
        return NextResponse.redirect(login);
      }

      const { data: keys } = await supabase.rpc("get_my_permission_keys");
      if (!hasAdminCapability(keys as string[] | null)) {
        // Fallback: super_admin RPC for pre-00011 envs
        const { data: isSa } = await supabase.rpc("is_super_admin", { p_user_id: user.id });
        if (!isSa) {
          const login = request.nextUrl.clone();
          login.pathname = `/${defaultLocale}/login`;
          login.searchParams.set("error", "forbidden");
          return NextResponse.redirect(login);
        }
      }
    }

    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
