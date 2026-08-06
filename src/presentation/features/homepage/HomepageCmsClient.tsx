"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/presentation/components/ui/input";
import { Label, Textarea, Switch, Card } from "@/presentation/components/ui/primitives";
import { updateHomepageSectionAction } from "@/actions/cms";
import type { HomepageSection } from "@/types/cms";
import { SuccessBanner, EmptyState } from "@/presentation/components/admin/AsyncStates";

function buildEnabledMap(sectionsAr: HomepageSection[], sectionsEn: HomepageSection[]) {
  const next: Record<string, boolean> = {};
  for (const section of [...sectionsAr, ...sectionsEn]) {
    next[section.id] = section.is_enabled;
  }
  return next;
}

export function HomepageCmsClient({
  sectionsAr,
  sectionsEn,
}: {
  sectionsAr: HomepageSection[];
  sectionsEn: HomepageSection[];
}) {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const router = useRouter();
  const [tab, setTab] = useState<"ar" | "en">("ar");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabledById, setEnabledById] = useState(() => buildEnabledMap(sectionsAr, sectionsEn));

  const source = tab === "ar" ? sectionsAr : sectionsEn;

  const sections = useMemo(
    () =>
      source.map((section) => ({
        ...section,
        is_enabled: enabledById[section.id] ?? section.is_enabled,
      })),
    [source, enabledById],
  );

  const persist = (payload: Parameters<typeof updateHomepageSectionAction>[0]) => {
    setError(null);
    startTransition(async () => {
      const res = await updateHomepageSectionAction(payload);
      if (res.ok) {
        setSaved(true);
        if (payload.is_enabled !== undefined) {
          setEnabledById((prev) => ({ ...prev, [payload.id]: payload.is_enabled! }));
        }
        router.refresh();
      } else {
        setError(res.error);
        if (payload.is_enabled !== undefined) {
          setEnabledById((prev) => ({
            ...prev,
            [payload.id]: !payload.is_enabled!,
          }));
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("homepage")}</h1>
        <div className="inline-flex rounded-full border border-[var(--border)] bg-white p-1 text-xs font-semibold">
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 ${tab === "ar" ? "bg-[var(--accent)] text-white" : ""}`}
            onClick={() => setTab("ar")}
          >
            {t("arabic")}
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 ${tab === "en" ? "bg-[var(--accent)] text-white" : ""}`}
            onClick={() => setTab("en")}
          >
            {t("english")}
          </button>
        </div>
      </div>

      {saved ? <SuccessBanner message={common("saved")} /> : null}
      {error ? (
        <p className="text-sm text-[var(--warning)]" role="alert">
          {error}
        </p>
      ) : null}
      {!sections.length ? <EmptyState title={common("empty")} /> : null}

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={`${tab}-${section.id}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  {section.key}
                </p>
                <p className="font-semibold text-[var(--primary)]">#{section.sort_order}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs">{section.is_enabled ? t("enabled") : t("disabled")}</span>
                <Switch
                  checked={section.is_enabled}
                  onCheckedChange={(v) => {
                    setEnabledById((prev) => ({ ...prev, [section.id]: v }));
                    persist({ id: section.id, is_enabled: v });
                  }}
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor={`title-${section.id}`}>{t("title")}</Label>
                <Input
                  id={`title-${section.id}`}
                  defaultValue={section.title ?? ""}
                  onBlur={(e) =>
                    persist(
                      tab === "ar"
                        ? { id: section.id, title_ar: e.target.value }
                        : { id: section.id, title_en: e.target.value },
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor={`order-${section.id}`}>{t("order")}</Label>
                <Input
                  id={`order-${section.id}`}
                  type="number"
                  defaultValue={section.sort_order}
                  onBlur={(e) =>
                    persist({
                      id: section.id,
                      sort_order: Number(e.target.value) || index + 1,
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-3">
              <Label htmlFor={`body-${section.id}`}>{t("body")}</Label>
              <Textarea
                id={`body-${section.id}`}
                defaultValue={section.body ?? ""}
                onBlur={(e) =>
                  persist(
                    tab === "ar"
                      ? { id: section.id, body_ar: e.target.value }
                      : { id: section.id, body_en: e.target.value },
                  )
                }
              />
            </div>
            {pending ? (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">{common("loading")}</p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
