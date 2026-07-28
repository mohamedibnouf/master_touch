"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Card } from "@/presentation/components/ui/primitives";
import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";
import { LoadingState } from "@/presentation/components/admin/AsyncStates";

const DashboardCharts = dynamic(() => import("@/presentation/features/admin/DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <LoadingState label="…" />
      <LoadingState label="…" />
    </div>
  ),
});

export default function AdminDashboardPage() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("dashboard")}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{t("welcome")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t("visitors"), value: "12.4k" },
          { label: t("projects"), value: "48" },
          { label: t("messages"), value: "28" },
          { label: t("applications"), value: "6" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">{item.label}</p>
            <p className="mt-2 font-display text-3xl text-[var(--primary)]">{item.value}</p>
          </Card>
        ))}
      </div>

      <DashboardCharts />

      <Card>
        <p className="mb-4 font-semibold text-[var(--primary)]">{t("quickActions")}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/homepage">
            <Button variant="accent">{t("homepage")}</Button>
          </Link>
          <Link href="/admin/services">
            <Button>{t("services")}</Button>
          </Link>
          <Link href="/admin/contact">
            <Button variant="outline">{t("contact")}</Button>
          </Link>
          <Link href="/admin/theme">
            <Button variant="secondary">{t("theme")}</Button>
          </Link>
        </div>
      </Card>

      <Card>
        <p className="mb-2 font-semibold text-[var(--primary)]">{t("systemHealth")}</p>
        <p className="text-sm text-emerald-700">{t("operational")}</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("latestActivity")}</p>
      </Card>
    </div>
  );
}
