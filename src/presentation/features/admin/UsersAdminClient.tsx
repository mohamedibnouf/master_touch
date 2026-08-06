"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, Badge, Label } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import {
  AdminModal,
  EmptyState,
  ErrorState,
  SuccessBanner,
} from "@/presentation/components/admin/AsyncStates";
import { inviteAdminUserAction } from "@/actions/admin-directory";

type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  roles: string[];
};

type AdminRole = {
  id: string;
  slug: string;
  name: string;
};

export function UsersAdminClient({
  users,
  roles,
  canManage,
}: {
  users: AdminUser[];
  roles: AdminRole[];
  canManage: boolean;
}) {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const assignableRoles = useMemo(
    () => roles.filter((r) => r.slug !== "super_admin"),
    [roles],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("users")}</h1>
        <Button
          variant="accent"
          type="button"
          disabled={!canManage}
          title={canManage ? undefined : "Requires users.manage permission"}
          onClick={() => {
            setError(null);
            setSuccess(false);
            setOpen(true);
          }}
        >
          {t("inviteUser")}
        </Button>
      </div>

      {success ? <SuccessBanner message={t("inviteSent")} /> : null}
      {error && !open ? <ErrorState title={common("error")} description={error} /> : null}

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

      <AdminModal open={open} title={t("inviteUser")} onClose={() => setOpen(false)}>
        {error ? <ErrorState title={common("error")} description={error} /> : null}
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setError(null);
            setSuccess(false);
            startTransition(async () => {
              const res = await inviteAdminUserAction(fd);
              if (res.ok) {
                setSuccess(true);
                setOpen(false);
              } else {
                setError(res.error);
              }
            });
          }}
        >
          <div>
            <Label htmlFor="invite-email">{common("email")}</Label>
            <Input id="invite-email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="invite-name">{t("fullName")}</Label>
            <Input id="invite-name" name="full_name" required minLength={2} maxLength={120} />
          </div>
          <div>
            <Label htmlFor="invite-role">{t("assignRole")}</Label>
            <select
              id="invite-role"
              name="role_id"
              required
              className="flex h-11 w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 text-sm dark:bg-[var(--surface)]"
              defaultValue={assignableRoles[0]?.id ?? ""}
            >
              {assignableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.slug})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="accent" disabled={pending || !assignableRoles.length}>
              {pending ? common("loading") : t("sendInvite")}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
