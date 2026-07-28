"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "inline-flex overflow-hidden rounded-full border text-xs font-semibold",
        compact ? "border-[var(--border)] bg-white" : "border-white/20 bg-white/10 backdrop-blur",
      )}
      role="group"
      aria-label="Language"
    >
      <Link
        href={switchLocale("ar")}
        className={cn(
          "px-3 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          locale === "ar"
            ? "bg-[var(--accent)] text-white"
            : compact
              ? "text-[var(--foreground)]"
              : "text-white/80",
        )}
        hrefLang="ar"
        lang="ar"
      >
        ع
      </Link>
      <Link
        href={switchLocale("en")}
        className={cn(
          "px-3 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          locale === "en"
            ? "bg-[var(--accent)] text-white"
            : compact
              ? "text-[var(--foreground)]"
              : "text-white/80",
        )}
        hrefLang="en"
        lang="en"
      >
        EN
      </Link>
    </div>
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

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--primary)] focus:shadow"
      >
        {common("skipToContent")}
      </a>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[color-mix(in_oklab,var(--primary)_78%,transparent)] backdrop-blur-xl">
        <div className="container-mt flex h-16 items-center justify-between gap-4 px-4 sm:h-[4.5rem]">
          <Link
            href={`/${locale}`}
            className="font-display text-2xl font-semibold tracking-wide text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {brand}
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== `/${locale}` && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    active ? "text-[var(--accent)]" : "text-white/85 hover:text-white",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link
              href={`/${locale}/contact`}
              className="hidden rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:inline-flex"
            >
              {t("contact")}
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? common("closeMenu") : common("openMenu")}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open ? (
          <nav
            id="mobile-nav"
            className="border-t border-white/10 bg-[var(--primary)] px-4 py-4 md:hidden"
            aria-label="Mobile"
          >
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-xl px-3 py-3 text-sm font-medium text-white hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>
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

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--primary)] text-white">
      <div className="container-mt grid gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-3xl">{brand}</p>
          <p className="mt-3 max-w-sm text-sm text-white/70">{tagline || t("tagline")}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
            {t("quickLinks")}
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href={`/${locale}`}>{nav("home")}</Link>
            </li>
            <li>
              <Link href={`/${locale}/about`}>{nav("about")}</Link>
            </li>
            <li>
              <Link href={`/${locale}/services`}>{nav("services")}</Link>
            </li>
            <li>
              <Link href={`/${locale}/contact`}>{nav("contact")}</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
            {t("contact")}
          </p>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <a href="mailto:info@mastertouchksa.com">info@mastertouchksa.com</a>
            </li>
            <li dir="ltr">
              <a href="tel:+966506834610">+966-50-683-4610</a>
            </li>
            <li>
              <a href="https://www.mastertouchksa.com" rel="noopener noreferrer" target="_blank">
                www.mastertouchksa.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {year} {brand}. {t("rights")}
      </div>
    </footer>
  );
}
