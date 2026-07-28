"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/presentation/components/ui/primitives";
import { Button } from "@/presentation/components/ui/button";
import { EmptyState } from "@/presentation/components/admin/AsyncStates";

export default function AdminMediaPage() {
  const t = useTranslations("admin");
  const items = ["hero-1", "hero-2", "hero-3", "about-cover"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("media")}</h1>
        <Button variant="accent">{t("upload")}</Button>
      </div>
      <Card>
        <p className="text-sm text-[var(--muted-foreground)]">{t("mediaHint")}</p>
        {!items.length ? <EmptyState title={t("noMedia")} /> : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((name) => (
            <div key={name} className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/placeholders/${name}.svg`}
                alt={name}
                className="h-28 w-full object-cover"
                loading="lazy"
              />
              <p className="px-3 py-2 text-xs">{name}.svg</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
