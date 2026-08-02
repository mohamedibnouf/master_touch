import { getTranslations } from "next-intl/server";
import { listTranslationRows } from "@/infrastructure/repositories/translations.repository";
import { TranslationsManagerClient } from "@/presentation/features/translations/TranslationsManagerClient";

export default async function AdminTranslationsPage() {
  const t = await getTranslations("admin");
  const rows = await listTranslationRows();

  const mapped = (rows ?? []).map((row) => {
    const nsRelation = row.translation_namespaces as unknown as
      | { slug: string }
      | { slug: string }[]
      | null;
    const namespace = Array.isArray(nsRelation) ? nsRelation[0]?.slug : nsRelation?.slug;
    return {
      id: String(row.id),
      key: String(row.key),
      locale: row.locale as "ar" | "en",
      value: String(row.value ?? ""),
      namespace: namespace ?? "common",
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("translations")}</h1>
      <TranslationsManagerClient rows={mapped} />
    </div>
  );
}
