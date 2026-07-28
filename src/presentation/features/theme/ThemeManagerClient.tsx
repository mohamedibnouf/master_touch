"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, Label } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { updateThemeAction } from "@/actions/cms";
import type { ThemeSettings } from "@/types/cms";
import { SuccessBanner, ErrorState } from "@/presentation/components/admin/AsyncStates";
import { ThemeModeSwitcher } from "@/presentation/components/shared/ThemeModeSwitcher";

export function ThemeManagerClient({ initialTheme }: { initialTheme: ThemeSettings }) {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const [theme, setTheme] = useState(initialTheme);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("theme")}</h1>
        <div>
          <p className="mb-2 text-xs text-[var(--muted-foreground)]">{t("themeMode")}</p>
          <ThemeModeSwitcher />
        </div>
      </div>
      {saved ? <SuccessBanner message={common("saved")} /> : null}
      {error ? <ErrorState title={common("error")} /> : null}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["primary_color", t("primary")],
              ["secondary_color", t("secondary")],
              ["accent_color", t("accent")],
              ["background_color", t("background")],
              ["foreground_color", t("foreground")],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <div className="flex gap-2">
                <Input
                  id={key}
                  type="color"
                  className="h-11 w-14 p-1"
                  value={theme[key]}
                  onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                />
                <Input
                  value={theme[key]}
                  onChange={(e) => setTheme((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            </div>
          ))}
          <div>
            <Label htmlFor="radius">{t("borderRadius")}</Label>
            <Input
              id="radius"
              value={theme.border_radius}
              onChange={(e) => setTheme((prev) => ({ ...prev, border_radius: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="sans">{t("sansFont")}</Label>
            <Input
              id="sans"
              value={theme.font_sans}
              onChange={(e) => setTheme((prev) => ({ ...prev, font_sans: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="display">{t("displayFont")}</Label>
            <Input
              id="display"
              value={theme.font_display}
              onChange={(e) => setTheme((prev) => ({ ...prev, font_display: e.target.value }))}
            />
          </div>
        </div>
        <div
          className="mt-6 rounded-2xl p-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.secondary_color})`,
          }}
        >
          <p className="text-sm" style={{ color: theme.accent_color }}>
            {t("accentPreview")}
          </p>
          <p className="font-display text-4xl">Master Touch</p>
        </div>
        <Button
          className="mt-4"
          variant="accent"
          disabled={pending}
          onClick={() => {
            setError(false);
            setSaved(false);
            startTransition(async () => {
              const res = await updateThemeAction({
                primary_color: theme.primary_color,
                secondary_color: theme.secondary_color,
                accent_color: theme.accent_color,
                background_color: theme.background_color,
                foreground_color: theme.foreground_color,
                border_radius: theme.border_radius,
                font_sans: theme.font_sans,
                font_display: theme.font_display,
              });
              if (res.ok) setSaved(true);
              else setError(true);
            });
          }}
        >
          {pending ? common("loading") : t("saveTheme")}
        </Button>
      </Card>
    </div>
  );
}
