import { getTranslations } from "next-intl/server";
import { Card } from "@/presentation/components/ui/primitives";
import { Button } from "@/presentation/components/ui/button";
import { EmptyState } from "@/presentation/components/admin/AsyncStates";
import { listAdminRolesAction } from "@/actions/admin-directory";
import { can, getCurrentUserPermissions } from "@/lib/permissions";

export default async function AdminRolesPage() {
  const t = await getTranslations("admin");
  const [result, permissions] = await Promise.all([
    listAdminRolesAction(),
    getCurrentUserPermissions(),
  ]);
  const roles = result.data;
  const canManageRoles = can(permissions, "roles.manage");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("roles")}</h1>
        <Button
          variant="accent"
          type="button"
          disabled={!canManageRoles}
          title={
            canManageRoles
              ? undefined
              : "Requires roles.manage permission"
          }
        >
          {t("configurePermissions")}
        </Button>
      </div>
      {!roles.length ? <EmptyState title={t("roles")} description="No roles found." /> : null}
      <div className="grid gap-3">
        {roles.map((r) => (
          <Card key={r.id}>
            <p className="font-semibold text-[var(--primary)]">{r.name}</p>
            <p className="text-xs font-mono text-[var(--muted-foreground)]">{r.slug}</p>
            {r.description ? (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{r.description}</p>
            ) : null}
            {r.is_system ? (
              <p className="mt-2 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">System role</p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
