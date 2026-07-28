import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./src/lib/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) {
    let response = NextResponse.next({ request });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

    if (pathname.startsWith("/admin") && !user) {
      const login = request.nextUrl.clone();
      login.pathname = `/${defaultLocale}/login`;
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
