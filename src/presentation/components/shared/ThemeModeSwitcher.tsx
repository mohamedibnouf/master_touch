"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/presentation/components/ui/button";

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
    return <div className="h-8 w-48 rounded-full border border-[var(--border)] bg-white/50" aria-hidden />;
  }

  const modes = [
    { id: "light", label: t("lightMode") },
    { id: "dark", label: t("darkMode") },
    { id: "system", label: t("systemMode") },
  ] as const;

  return (
    <div className="inline-flex rounded-full border border-[var(--border)] bg-white p-1 text-xs dark:bg-[var(--secondary)]">
      {modes.map((mode) => (
        <Button
          key={mode.id}
          type="button"
          size="sm"
          variant={theme === mode.id ? "accent" : "ghost"}
          className="h-8 rounded-full px-3"
          onClick={() => setTheme(mode.id)}
          aria-pressed={theme === mode.id}
        >
          {mode.label}
        </Button>
      ))}
    </div>
  );
}
