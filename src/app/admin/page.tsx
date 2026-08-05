import { getTranslations } from "next-intl/server";
import { Card } from "@/presentation/components/ui/primitives";
import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";
import { getDashboardStatsAction } from "@/actions/admin-directory";
import { DashboardChartsSlot } from "@/presentation/features/admin/DashboardChartsSlot";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin");
  const stats = await getDashboardStatsAction();
  const data = stats.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("dashboard")}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{t("welcome")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t("services"), value: String(data.services) },
          { label: t("messages"), value: String(data.messages) },
          { label: t("media"), value: String(data.media) },
          {
            label: t("latestActivity"),
            value: String(Array.isArray(data.recent) ? data.recent.length : 0),
          },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">{item.label}</p>
            <p className="mt-2 font-display text-3xl text-[var(--primary)]">{item.value}</p>
          </Card>
        ))}
      </div>

      <DashboardChartsSlot />

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
        <ul className="mt-3 space-y-1 text-sm text-[var(--muted-foreground)]">
          {Array.isArray(data.recent) && data.recent.length ? (
            data.recent.map((row) => (
              <li key={row.id}>
                <span className="font-mono text-xs">{row.action}</span>
                <span className="mx-2">·</span>
                <span>{row.entity_type}</span>
              </li>
            ))
          ) : (
            <li>{t("latestActivity")}</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
