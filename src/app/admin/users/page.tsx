import { getTranslations } from "next-intl/server";
import { Card, Badge } from "@/presentation/components/ui/primitives";
import { Button } from "@/presentation/components/ui/button";
import { EmptyState } from "@/presentation/components/admin/AsyncStates";
import { listAdminUsersAction } from "@/actions/admin-directory";

export default async function AdminUsersPage() {
  const t = await getTranslations("admin");
  const result = await listAdminUsersAction();
  const users = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("users")}</h1>
        <Button variant="accent" type="button" disabled title="Invite flow is not enabled in this release">
          {t("inviteUser")}
        </Button>
      </div>
      {!users.length ? <EmptyState title={t("noUsers")} /> : null}
      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[var(--primary)]">{u.full_name || u.email}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{u.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(u.roles.length ? u.roles : ["unassigned"]).map((role) => (
                <Badge key={role}>{role}</Badge>
              ))}
              {u.is_active ? (
                <Badge className="bg-emerald-50 text-emerald-700">{t("active")}</Badge>
              ) : (
                <Badge className="bg-[var(--muted)] text-[var(--muted-foreground)]">inactive</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
