"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X, Mail, Phone, Globe, MapPin, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/presentation/components/shared/ThemeProvider";
import { BrandLogo } from "@/presentation/components/shared/BrandLogo";

export function LocaleSwitcher({ compact }: { compact?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();

  const switchLocale = (next: string) => {
    if (!pathname) return `/${next}`;
    const segments = pathname.split("/");
    segments[1] = next;
    return segments.join("/") || `/${next}`;
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold tracking-[0.14em]",
        compact ? "text-[var(--foreground)]" : "text-white/70",
      )}
      role="group"
      aria-label="Language"
    >
      <Link
        href={switchLocale("ar")}
        className={cn(
          "inline-flex min-h-11 min-w-9 items-center justify-center px-1.5 py-1 text-xs font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          locale === "ar"
            ? compact
              ? "text-[var(--accent)]"
              : "text-white"
            : "opacity-70 hover:opacity-100",
        )}
        hrefLang="ar"
        lang="ar"
        aria-current={locale === "ar" ? "true" : undefined}
      >
        ع
      </Link>
      <span aria-hidden className="opacity-40 text-xs">
        /
      </span>
      <Link
        href={switchLocale("en")}
        className={cn(
          "inline-flex min-h-11 min-w-9 items-center justify-center px-1.5 py-1 text-xs font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          locale === "en"
            ? compact
              ? "text-[var(--accent)]"
              : "text-white"
            : "opacity-70 hover:opacity-100",
        )}
        hrefLang="en"
        lang="en"
        aria-current={locale === "en" ? "true" : undefined}
      >
        EN
      </Link>
    </div>
  );
}

function ThemeQuickToggle({ light }: { light?: boolean }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <span className="inline-block h-11 w-11" aria-hidden />;
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        light ? "text-white/80 hover:text-white" : "text-[var(--foreground)]",
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function useNavLinks() {
  const t = useTranslations("nav");
  const locale = useLocale();
  return [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/services`, label: t("services") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];
}

export function SiteHeader({ brand }: { brand: string }) {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const links = useNavLinks();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
      >
        {common("skipToContent")}
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-all duration-500",
          scrolled || open
            ? "border-b border-white/10 bg-[color-mix(in_oklab,#06101c_92%,transparent)] shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl"
            : "border-b border-transparent bg-gradient-to-b from-[rgba(6,16,28,0.78)] via-[rgba(6,16,28,0.35)] to-transparent",
        )}
      >
        <div className="relative h-[var(--header-height)] w-full">
          <Link
            href={`/${locale}`}
            className="absolute start-0 top-1/2 z-[1] flex -translate-y-1/2 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label={brand}
          >
            <BrandLogo
              priority
              className="h-[calc(var(--header-height)-0.15rem)] w-auto max-w-[min(92vw,34rem)]"
              sizes="(max-width:640px) 280px, (max-width:1024px) 420px, 544px"
            />
          </Link>
          <nav
            className="absolute left-1/2 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 lg:flex lg:gap-1"
            aria-label="Primary"
          >
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== `/${locale}` && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative whitespace-nowrap px-3.5 py-2 text-[0.78rem] font-medium tracking-[0.1em] uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rtl:tracking-normal",
                    active ? "text-white" : "text-white/65 hover:text-white",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  {active ? (
                    <span className="absolute -bottom-0.5 inset-x-3 mx-auto h-px bg-[var(--accent)]" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="absolute end-0 top-1/2 z-[1] flex -translate-y-1/2 items-center gap-1 pe-[var(--page-gutter)] sm:gap-2">
            <ThemeQuickToggle light />
            <LocaleSwitcher />
            <Link
              href={`/${locale}/contact`}
              className="hidden min-h-11 items-center rounded-[var(--radius)] bg-[var(--accent)] px-5 text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-white shadow-[var(--shadow-cta)] transition hover:brightness-110 hover:shadow-[var(--shadow-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06101c] lg:inline-flex rtl:tracking-normal"
            >
              {t("contact")}
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center border border-white/20 text-white transition hover:border-white/40 hover:bg-white/5 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? common("closeMenu") : common("openMenu")}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label={common("closeMenu")}
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="absolute inset-x-0 top-[var(--header-height)] max-h-[calc(100svh-var(--header-height))] overflow-y-auto border-t border-white/10 bg-[#06101c] px-[var(--page-gutter)] py-6"
            aria-label="Mobile"
          >
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-12 items-center px-2 py-3 text-base font-medium tracking-wide text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-3">
                <Link
                  href={`/${locale}/contact`}
                  className="flex min-h-12 items-center justify-center rounded-[var(--radius)] bg-[var(--accent)] px-4 text-sm font-semibold tracking-[0.14em] uppercase text-white shadow-[var(--shadow-cta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  onClick={() => setOpen(false)}
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}

export function SiteFooter({
  brand,
  tagline,
  year,
}: {
  brand: string;
  tagline: string;
  year: number;
}) {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();

  const links = [
    { href: `/${locale}`, label: nav("home") },
    { href: `/${locale}/about`, label: nav("about") },
    { href: `/${locale}/services`, label: nav("services") },
    { href: `/${locale}/contact`, label: nav("contact") },
  ];

  return (
    <footer className="site-footer relative isolate overflow-hidden text-[#e8eef6]">
      <div className="site-footer__grid" aria-hidden />
      <div className="site-footer__glow" aria-hidden />

      <div className="container-mt relative z-[1] px-[var(--page-gutter)] pt-[clamp(3.75rem,9vw,5.5rem)] pb-14">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-5">
            <p className="font-display text-[0.65rem] tracking-[0.22em] text-[var(--accent)]">
              MASTER TOUCH
            </p>
            <Link
              href={`/${locale}`}
              className="mt-5 inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              aria-label={brand}
            >
              <BrandLogo className="h-20 w-auto max-w-[min(92vw,28rem)] sm:h-24 lg:h-28" sizes="448px" />
            </Link>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/65">
              {tagline || t("tagline")}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="h-px w-12 bg-[var(--accent)]" aria-hidden />
              <span className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-white/45">
                {locale === "ar" ? "تشطيب · أنظمة ذكية · تعاقد" : "Fit-out · Smart systems · Contracting"}
              </span>
            </div>
            <Link
              href={`/${locale}/contact`}
              className="mt-9 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-5 text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-white shadow-[var(--shadow-cta)] transition hover:brightness-110 hover:shadow-[var(--shadow-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06101c]"
            >
              {nav("contact")}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3 lg:gap-8">
            <div className="site-footer__col">
              <p className="site-footer__heading">{t("quickLinks")}</p>
              <ul className="mt-5 space-y-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link className="site-footer__link group" href={link.href}>
                      <span className="site-footer__link-mark" aria-hidden />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="site-footer__col">
              <p className="site-footer__heading">{t("contact")}</p>
              <ul className="mt-5 space-y-1">
                <li>
                  <a className="site-footer__link" href="mailto:info@mastertouchksa.com">
                    <Mail className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    <span className="break-all">info@mastertouchksa.com</span>
                  </a>
                </li>
                <li>
                  <a className="site-footer__link" href="tel:+966506834610" dir="ltr">
                    <Phone className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    +966-50-683-4610
                  </a>
                </li>
                <li>
                  <a
                    className="site-footer__link"
                    href="https://www.mastertouchksa.com"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Globe className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    <span className="break-all">www.mastertouchksa.com</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="site-footer__col sm:col-span-2 lg:col-span-1">
              <p className="site-footer__heading">{locale === "ar" ? "المقر" : "Headquarters"}</p>
              <div className="mt-5 flex gap-3 text-sm leading-relaxed text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                <p>
                  {locale === "ar"
                    ? "الرياض، المملكة العربية السعودية"
                    : "Riyadh, Kingdom of Saudi Arabia"}
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                {(locale === "ar"
                  ? ["تشطيب", "ذكي", "AV", "تعاقد"]
                  : ["Finishing", "Smart", "AV", "Fit-out"]
                ).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[var(--radius)] border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-white/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[1] border-t border-white/10 bg-black/20">
        <div className="container-mt flex flex-col gap-4 px-[var(--page-gutter)] py-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-white/45 sm:text-start">
            © {year} {brand}. {t("rights")}
          </p>
          <p className="inline-flex items-center justify-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-white/50 sm:justify-end">
            <span className="inline-block h-1.5 w-1.5 bg-[var(--accent)]" aria-hidden />
            Engineering Precision
          </p>
        </div>
      </div>
    </footer>
  );
}

