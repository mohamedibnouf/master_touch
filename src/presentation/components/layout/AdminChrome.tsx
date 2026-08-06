"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  Home,
  Building2,
  Briefcase,
  Mail,
  Image,
  Palette,
  Languages,
  Settings,
  UserCircle,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ThemeModeSwitcher } from "@/presentation/components/shared/ThemeModeSwitcher";
import { BrandLogo } from "@/presentation/components/shared/BrandLogo";

const items = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard },
  { href: "/admin/users", key: "users", icon: Users },
  { href: "/admin/roles", key: "roles", icon: Shield },
  { href: "/admin/homepage", key: "homepage", icon: Home },
  { href: "/admin/about", key: "about", icon: Building2 },
  { href: "/admin/services", key: "services", icon: Briefcase },
  { href: "/admin/contact", key: "contact", icon: Mail },
  { href: "/admin/media", key: "media", icon: Image },
  { href: "/admin/theme", key: "theme", icon: Palette },
  { href: "/admin/translations", key: "translations", icon: Languages },
  { href: "/admin/seo", key: "seo", icon: Search },
  { href: "/admin/settings", key: "settings", icon: Settings },
  { href: "/admin/profile", key: "profile", icon: UserCircle },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("admin");

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3" aria-label="Admin">
      {items.map(({ href, key, icon: Icon }) => {
        const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              active
                ? "bg-[var(--accent)] text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-e border-[var(--border)] bg-[var(--primary)] text-white lg:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <BrandLogo className="h-10 w-auto max-w-[11rem]" sizes="160px" />
        <p className="mt-2 text-xs text-white/60">CMS Admin</p>
      </div>
      <NavLinks />
    </aside>
  );
}

export function AdminTopbar() {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const [open, setOpen] = useState(false);

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

  // Close mobile drawer when route changes via browser navigation.
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-white/95 px-3 backdrop-blur dark:bg-[color-mix(in_oklab,var(--secondary)_94%,transparent)] sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label={open ? common("closeMenu") : common("openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <p className="truncate text-sm font-medium text-[var(--muted-foreground)]">{t("welcome")}</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="max-w-full overflow-x-auto">
            <ThemeModeSwitcher />
          </div>
          <Link
            href="/ar"
            className="inline-flex min-h-11 items-center whitespace-nowrap text-xs font-semibold text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {common("viewSite")}
          </Link>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label={common("closeMenu")}
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 start-0 flex w-[min(18rem,88vw)] flex-col bg-[var(--primary)] text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <BrandLogo className="h-9 w-auto max-w-[10rem]" sizes="144px" />
                <p className="mt-1 text-xs text-white/60">CMS Admin</p>
              </div>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center border border-white/20"
                aria-label={common("closeMenu")}
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
