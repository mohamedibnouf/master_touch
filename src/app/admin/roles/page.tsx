"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/presentation/components/ui/primitives";
import { Button } from "@/presentation/components/ui/button";

const roles = [
  { slug: "super_admin", name: "Super Admin", perms: "All permissions (bypass)" },
  { slug: "administrator", name: "Administrator", perms: "Users, roles, CMS, theme, settings" },
  { slug: "content_manager", name: "Content Manager", perms: "Homepage, about, services, media, publish" },
  { slug: "marketing", name: "Marketing", perms: "Update homepage/about/services, media upload" },
  { slug: "hr", name: "HR", perms: "Dashboard + media (careers in Phase 2)" },
  { slug: "editor", name: "Editor", perms: "Update content, no delete/publish" },
  { slug: "viewer", name: "Viewer", perms: "Read-only" },
];

export default function AdminRolesPage() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("roles")}</h1>
        <Button variant="accent">{t("configurePermissions")}</Button>
      </div>
      <div className="grid gap-3">
        {roles.map((r) => (
          <Card key={r.slug}>
            <p className="font-semibold text-[var(--primary)]">{r.name}</p>
            <p className="text-xs font-mono text-[var(--muted-foreground)]">{r.slug}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{r.perms}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
