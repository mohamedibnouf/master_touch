"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/presentation/components/ui/button";
import { useTheme } from "@/presentation/components/shared/ThemeProvider";

function subscribe() {
  return () => undefined;
}

function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function ThemeModeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("admin");
  const mounted = useIsClient();

  if (!mounted) {
    return <div className="h-10 w-36 rounded-lg border border-[var(--border)] bg-white/50 sm:w-48" aria-hidden />;
  }

  const modes = [
    { id: "light", label: t("lightMode"), short: "L" },
    { id: "dark", label: t("darkMode"), short: "D" },
    { id: "system", label: t("systemMode"), short: "S" },
  ] as const;

  return (
    <div className="inline-flex max-w-full rounded-lg border border-[var(--border)] bg-white p-1 text-xs dark:bg-[var(--secondary)]">
      {modes.map((mode) => (
        <Button
          key={mode.id}
          type="button"
          size="sm"
          variant={theme === mode.id ? "accent" : "ghost"}
          className="h-9 min-h-9 shrink-0 px-2.5 sm:px-3"
          onClick={() => setTheme(mode.id)}
          aria-pressed={theme === mode.id}
          aria-label={mode.label}
          title={mode.label}
        >
          <span className="sm:hidden">{mode.short}</span>
          <span className="hidden sm:inline">{mode.label}</span>
        </Button>
      ))}
    </div>
  );
}
