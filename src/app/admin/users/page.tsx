"use client";

import { useTranslations } from "next-intl";
import { Card, Badge } from "@/presentation/components/ui/primitives";
import { Button } from "@/presentation/components/ui/button";
import { EmptyState } from "@/presentation/components/admin/AsyncStates";

const demoUsers = [
  { name: "Super Admin", email: "admin@mastertouchksa.com", role: "super_admin", active: true },
  { name: "Content Manager", email: "content@mastertouchksa.com", role: "content_manager", active: true },
  { name: "Editor", email: "editor@mastertouchksa.com", role: "editor", active: true },
];

export default function AdminUsersPage() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("users")}</h1>
        <Button variant="accent">{t("inviteUser")}</Button>
      </div>
      {!demoUsers.length ? <EmptyState title={t("noUsers")} /> : null}
      <div className="space-y-3">
        {demoUsers.map((u) => (
          <Card key={u.email} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[var(--primary)]">{u.name}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{u.role}</Badge>
              {u.active ? <Badge className="bg-emerald-50 text-emerald-700">{t("active")}</Badge> : null}
              <Button variant="outline" size="sm">
                {t("edit")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
