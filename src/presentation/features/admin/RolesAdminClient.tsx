"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, Label } from "@/presentation/components/ui/primitives";
import { Button } from "@/presentation/components/ui/button";
import {
  AdminModal,
  EmptyState,
  ErrorState,
  LoadingState,
  SuccessBanner,
} from "@/presentation/components/admin/AsyncStates";
import {
  getRolePermissionKeysAction,
  listPermissionCatalogAction,
  setRolePermissionsAction,
} from "@/actions/admin-directory";

type AdminRole = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_system: boolean;
};

type PermissionRow = {
  id: string;
  key: string;
  module: string;
  action: string;
};

export function RolesAdminClient({
  roles,
  canManage,
}: {
  roles: AdminRole[];
  canManage: boolean;
}) {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id ?? "");
  const [catalog, setCatalog] = useState<PermissionRow[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, PermissionRow[]>();
    for (const p of catalog) {
      const list = map.get(p.module) ?? [];
      list.push(p);
      map.set(p.module, list);
    }
    return Array.from(map.entries());
  }, [catalog]);

  async function loadMatrix(roleId: string) {
    if (!roleId) return;
    setLoadingMatrix(true);
    setError(null);
    const [catalogRes, keysRes] = await Promise.all([
      listPermissionCatalogAction(),
      getRolePermissionKeysAction(roleId),
    ]);
    if (!catalogRes.ok) {
      setError(catalogRes.error);
      setLoadingMatrix(false);
      return;
    }
    if (!keysRes.ok) {
      setError(keysRes.error);
      setLoadingMatrix(false);
      return;
    }
    setCatalog(catalogRes.data);
    setSelectedKeys(new Set(keysRes.data));
    setLoadingMatrix(false);
  }

  function openManager(roleId?: string) {
    setSuccess(false);
    setError(null);
    const nextId = roleId || selectedRoleId || roles[0]?.id || "";
    setSelectedRoleId(nextId);
    setOpen(true);
    void loadMatrix(nextId);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("roles")}</h1>
        <Button
          variant="accent"
          type="button"
          disabled={!canManage || !roles.length}
          title={canManage ? undefined : "Requires roles.manage permission"}
          onClick={() => openManager()}
        >
          {t("configurePermissions")}
        </Button>
      </div>

      {success ? <SuccessBanner message={common("saved")} /> : null}
      {error && !open ? <ErrorState title={common("error")} description={error} /> : null}

      {!roles.length ? <EmptyState title={t("roles")} description="No roles found." /> : null}
      <div className="grid gap-3">
        {roles.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-[var(--primary)]">{r.name}</p>
              <p className="text-xs font-mono text-[var(--muted-foreground)]">{r.slug}</p>
              {r.description ? (
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{r.description}</p>
              ) : null}
              {r.is_system ? (
                <p className="mt-2 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  System role
                </p>
              ) : null}
            </div>
            {canManage ? (
              <Button type="button" variant="outline" size="sm" onClick={() => openManager(r.id)}>
                {t("configurePermissions")}
              </Button>
            ) : null}
          </Card>
        ))}
      </div>

      <AdminModal
        open={open}
        title={t("configurePermissions")}
        onClose={() => setOpen(false)}
        wide
      >
        {error ? <ErrorState title={common("error")} description={error} /> : null}
        <div className="space-y-4">
          <div>
            <Label htmlFor="role-select">{t("roles")}</Label>
            <select
              id="role-select"
              className="flex h-11 w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 text-sm dark:bg-[var(--surface)]"
              value={selectedRoleId}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedRoleId(next);
                void loadMatrix(next);
              }}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.slug})
                </option>
              ))}
            </select>
          </div>

          {selectedRole?.slug === "super_admin" ? (
            <p className="text-sm text-[var(--muted-foreground)]">{t("superAdminBypassHint")}</p>
          ) : null}

          {loadingMatrix ? (
            <LoadingState label={common("loading")} />
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData();
                fd.set("role_id", selectedRoleId);
                for (const key of selectedKeys) fd.append("permission_key", key);
                setError(null);
                setSuccess(false);
                startTransition(async () => {
                  const res = await setRolePermissionsAction(fd);
                  if (res.ok) {
                    setSuccess(true);
                    setOpen(false);
                  } else {
                    setError(res.error);
                  }
                });
              }}
            >
              <div className="space-y-4">
                {grouped.map(([moduleName, perms]) => (
                  <fieldset key={moduleName} className="rounded-[var(--radius)] border border-[var(--line)] p-4">
                    <legend className="px-1 text-sm font-semibold text-[var(--primary)]">{moduleName}</legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {perms.map((p) => {
                        const checked = selectedKeys.has(p.key);
                        return (
                          <label
                            key={p.id}
                            className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[var(--foreground)]"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-[var(--accent)]"
                              checked={checked}
                              onChange={(e) => {
                                setSelectedKeys((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(p.key);
                                  else next.delete(p.key);
                                  return next;
                                });
                              }}
                            />
                            <span className="font-mono text-xs">{p.key}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" variant="accent" disabled={pending || !canManage}>
                  {pending ? common("loading") : t("savePermissions")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
