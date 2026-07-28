import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getServices } from "@/infrastructure/repositories/content.repository";
import { Card, Badge } from "@/presentation/components/ui/primitives";
import { Button } from "@/presentation/components/ui/button";
import { EmptyState } from "@/presentation/components/admin/AsyncStates";

export default async function AdminServicesPage() {
  const services = await getServices("en");
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("services")}</h1>
        <Button variant="accent">{t("createService")}</Button>
      </div>
      {!services.length ? <EmptyState title={t("noServices")} /> : null}
      <div className="grid gap-4">
        {services.map((s) => (
          <Card key={s.id} className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-[var(--primary)]">{s.title}</h2>
                {s.is_featured ? <Badge>{t("featured")}</Badge> : null}
                {s.is_published ? (
                  <Badge className="bg-emerald-50 text-emerald-700">{t("published")}</Badge>
                ) : null}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{s.summary}</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">/{s.slug}</p>
            </div>
            <Link href={`/ar/services/${s.slug}`}>
              <Button variant="outline">{t("edit")}</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
