"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { SuccessBanner } from "@/presentation/components/admin/AsyncStates";
import { saveTranslationAction } from "@/actions/cms";

const rows = [
  { ns: "nav", key: "home", ar: "الرئيسية", en: "Home" },
  { ns: "nav", key: "about", ar: "من نحن", en: "About" },
  { ns: "nav", key: "services", ar: "خدماتنا", en: "Services" },
  { ns: "nav", key: "contact", ar: "تواصل معنا", en: "Contact" },
  { ns: "common", key: "brand", ar: "ماستر تاتش", en: "Master Touch" },
  {
    ns: "footer",
    key: "tagline",
    ar: "اللمسة الأخيرة نحو التميز والتقنية",
    en: "The final touch toward excellence and technology",
  },
];

export default function AdminTranslationsPage() {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("translations")}</h1>
      <p className="text-sm text-[var(--muted-foreground)]">{t("translationsHint")}</p>
      {saved ? <SuccessBanner message={common("saved")} /> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={`${row.ns}.${row.key}`} className="grid gap-3 md:grid-cols-[140px_1fr_1fr_auto]">
            <p className="text-xs font-mono text-[var(--muted-foreground)]">
              {row.ns}.{row.key}
            </p>
            <Input defaultValue={row.ar} dir="rtl" aria-label={`${row.key} Arabic`} />
            <Input defaultValue={row.en} aria-label={`${row.key} English`} />
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  await saveTranslationAction({
                    namespaceSlug: row.ns,
                    key: row.key,
                    locale: "en",
                    value: row.en,
                  });
                  await saveTranslationAction({
                    namespaceSlug: row.ns,
                    key: row.key,
                    locale: "ar",
                    value: row.ar,
                  });
                  setSaved(true);
                });
              }}
            >
              {t("save")}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
