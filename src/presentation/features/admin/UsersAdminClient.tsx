"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, Badge, Label } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import {
  AdminModal,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  SuccessBanner,
} from "@/presentation/components/admin/AsyncStates";
import { inviteAdminUserAction, type AdminUserStatus } from "@/actions/admin-directory";
import {
  changeAdminUserRoleAction,
  deleteAdminUserAction,
  disableAdminUserAction,
  enableAdminUserAction,
  resendAdminInviteAction,
  updateAdminUserAction,
} from "@/actions/admin-user-management";

type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  status: AdminUserStatus;
  roles: string[];
  role_ids: string[];
};

type AdminRole = {
  id: string;
  slug: string;
  name: string;
};

type ModalMode = "invite" | "edit" | "role" | null;
type ConfirmMode = "disable" | "enable" | "delete" | "resend" | null;

function formatActionError(res: {
  error?: string;
  step?: string;
  code?: string;
  status?: number;
  errorMessage?: string;
  errorCode?: string;
  errorStatus?: number;
  errorDescription?: string;
  stack?: string;
}): string {
  const parts = [
    res.step ? `step=${res.step}` : null,
    res.error,
    res.errorMessage && res.errorMessage !== res.error ? `message=${res.errorMessage}` : null,
    res.errorCode || res.code ? `code=${res.errorCode ?? res.code}` : null,
    typeof (res.errorStatus ?? res.status) === "number"
      ? `status=${res.errorStatus ?? res.status}`
      : null,
    res.errorDescription ? `description=${res.errorDescription}` : null,
    res.stack ? String(res.stack) : null,
  ].filter((p): p is string => Boolean(p && String(p).trim() && String(p).trim() !== "{}"));
  return parts.join(" · ") || "Action failed";
}

export function UsersAdminClient({
  users,
  roles,
  canManage,
  canSuperManage = false,
  listError = null,
}: {
  users: AdminUser[];
  roles: AdminRole[];
  canManage: boolean;
  canSuperManage?: boolean;
  listError?: string | null;
}) {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const router = useRouter();
  const [modal, setModal] = useState<ModalMode>(null);
  const [confirm, setConfirm] = useState<ConfirmMode>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const inviteRoles = useMemo(() => {
    const withoutSuper = roles.filter((r) => r.slug !== "super_admin");
    return withoutSuper.length > 0 ? withoutSuper : roles;
  }, [roles]);

  const manageRoles = useMemo(() => roles, [roles]);

  const closeModals = () => {
    setModal(null);
    setConfirm(null);
    setSelected(null);
    setMenuOpenId(null);
  };

  const runMutation = (
    fn: () => Promise<{ ok: boolean; error?: string; step?: string; code?: string; status?: number }>,
    okMessage: string,
  ) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        setSuccess(okMessage);
        closeModals();
        router.refresh();
      } else {
        setError(formatActionError(res));
        setConfirm(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-[var(--primary)]">{t("users")}</h1>
        {canManage ? (
          <Button
            variant="accent"
            type="button"
            onClick={() => {
              setError(null);
              setSuccess(null);
              setSelected(null);
              setModal("invite");
            }}
          >
            {t("inviteUser")}
          </Button>
        ) : null}
      </div>

      {success ? <SuccessBanner message={success} /> : null}
      {listError ? <ErrorState title={common("error")} description={listError} /> : null}
      {error && !modal ? <ErrorState title={common("error")} description={error} /> : null}

      {!users.length && !listError ? <EmptyState title={t("noUsers")} /> : null}
      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[var(--primary)]">{u.full_name || u.email}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{u.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(u.roles.length ? u.roles : ["unassigned"]).map((role) => (
                <Badge key={role}>{role}</Badge>
              ))}
              {u.status === "active" ? (
                <Badge className="bg-emerald-50 text-emerald-700">{t("active")}</Badge>
              ) : u.status === "pending" ? (
                <Badge className="bg-amber-50 text-amber-800">{t("pending")}</Badge>
              ) : (
                <Badge className="bg-[var(--muted)] text-[var(--muted-foreground)]">{t("disabled")}</Badge>
              )}
              {canSuperManage ? (
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-9 px-0"
                    aria-label={t("userActions")}
                    aria-expanded={menuOpenId === u.id}
                    onClick={() => setMenuOpenId((id) => (id === u.id ? null : u.id))}
                  >
                    ⋮
                  </Button>
                  {menuOpenId === u.id ? (
                    <div
                      role="menu"
                      className="absolute end-0 z-20 mt-1 min-w-52 rounded-[var(--radius)] border border-[var(--line)] bg-white py-1 shadow-[var(--shadow-lift)] dark:bg-[var(--surface)]"
                    >
                      <MenuItem
                        label={t("editUser")}
                        onClick={() => {
                          setSelected(u);
                          setMenuOpenId(null);
                          setError(null);
                          setModal("edit");
                        }}
                      />
                      <MenuItem
                        label={t("changeRole")}
                        onClick={() => {
                          setSelected(u);
                          setMenuOpenId(null);
                          setError(null);
                          setModal("role");
                        }}
                      />
                      {u.status === "disabled" ? (
                        <MenuItem
                          label={t("enableAccount")}
                          onClick={() => {
                            setSelected(u);
                            setMenuOpenId(null);
                            setConfirm("enable");
                          }}
                        />
                      ) : (
                        <MenuItem
                          label={t("disableAccount")}
                          onClick={() => {
                            setSelected(u);
                            setMenuOpenId(null);
                            setConfirm("disable");
                          }}
                        />
                      )}
                      {u.status === "pending" ? (
                        <MenuItem
                          label={t("resendInvite")}
                          onClick={() => {
                            setSelected(u);
                            setMenuOpenId(null);
                            setConfirm("resend");
                          }}
                        />
                      ) : null}
                      <MenuItem
                        label={t("deleteUser")}
                        danger
                        onClick={() => {
                          setSelected(u);
                          setMenuOpenId(null);
                          setConfirm("delete");
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <AdminModal
        open={modal === "invite"}
        title={t("inviteUser")}
        onClose={() => setModal(null)}
      >
        {error ? (
          <div className="mb-4">
            <ErrorState title={common("error")} description={error} />
          </div>
        ) : null}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            runMutation(async () => inviteAdminUserAction(fd), t("inviteSent"));
          }}
        >
          <InviteFields
            roles={inviteRoles}
            commonEmail={common("email")}
            fullNameLabel={t("fullName")}
            assignRoleLabel={t("assignRole")}
          />
          <FormActions
            pending={pending}
            cancelLabel={t("cancel")}
            submitLabel={t("sendInvite")}
            loadingLabel={common("loading")}
            onCancel={() => setModal(null)}
            disabled={inviteRoles.length === 0}
          />
        </form>
      </AdminModal>

      <AdminModal open={modal === "edit"} title={t("editUser")} onClose={() => setModal(null)}>
        {error ? (
          <div className="mb-4">
            <ErrorState title={common("error")} description={error} />
          </div>
        ) : null}
        {selected ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("user_id", selected.id);
              runMutation(async () => updateAdminUserAction(fd), t("userUpdated"));
            }}
          >
            <div>
              <Label htmlFor="edit-email">{common("email")}</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                required
                defaultValue={selected.email}
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="edit-name">{t("fullName")}</Label>
              <Input
                id="edit-name"
                name="full_name"
                required
                minLength={2}
                maxLength={120}
                defaultValue={selected.full_name ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">{t("assignRole")}</Label>
              <select
                id="edit-role"
                name="role_id"
                required
                className="flex h-11 w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 text-sm dark:bg-[var(--surface)]"
                defaultValue={selected.role_ids[0] ?? manageRoles[0]?.id ?? ""}
              >
                {manageRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.slug})
                  </option>
                ))}
              </select>
            </div>
            <FormActions
              pending={pending}
              cancelLabel={t("cancel")}
              submitLabel={t("saveChanges")}
              loadingLabel={common("loading")}
              onCancel={() => setModal(null)}
              disabled={manageRoles.length === 0}
            />
          </form>
        ) : null}
      </AdminModal>

      <AdminModal open={modal === "role"} title={t("changeRole")} onClose={() => setModal(null)}>
        {error ? (
          <div className="mb-4">
            <ErrorState title={common("error")} description={error} />
          </div>
        ) : null}
        {selected ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("user_id", selected.id);
              runMutation(async () => changeAdminUserRoleAction(fd), t("roleChanged"));
            }}
          >
            <p className="text-sm text-[var(--muted-foreground)]">
              {selected.full_name || selected.email} · {selected.email}
            </p>
            <div>
              <Label htmlFor="change-role">{t("assignRole")}</Label>
              <select
                id="change-role"
                name="role_id"
                required
                className="flex h-11 w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 text-sm dark:bg-[var(--surface)]"
                defaultValue={selected.role_ids[0] ?? manageRoles[0]?.id ?? ""}
              >
                {manageRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.slug})
                  </option>
                ))}
              </select>
            </div>
            <FormActions
              pending={pending}
              cancelLabel={t("cancel")}
              submitLabel={t("saveChanges")}
              loadingLabel={common("loading")}
              onCancel={() => setModal(null)}
              disabled={manageRoles.length === 0}
            />
          </form>
        ) : null}
      </AdminModal>

      <ConfirmDialog
        open={confirm === "disable" && Boolean(selected)}
        title={t("disableAccount")}
        description={t("confirmDisable", {
          name: selected?.full_name || selected?.email || "",
          email: selected?.email || "",
        })}
        confirmLabel={t("disableAccount")}
        cancelLabel={t("cancel")}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!selected) return;
          runMutation(async () => disableAdminUserAction(selected.id), t("userDisabled"));
        }}
      />

      <ConfirmDialog
        open={confirm === "enable" && Boolean(selected)}
        title={t("enableAccount")}
        description={t("confirmEnable", {
          name: selected?.full_name || selected?.email || "",
          email: selected?.email || "",
        })}
        confirmLabel={t("enableAccount")}
        cancelLabel={t("cancel")}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!selected) return;
          runMutation(async () => enableAdminUserAction(selected.id), t("userEnabled"));
        }}
      />

      <ConfirmDialog
        open={confirm === "resend" && Boolean(selected)}
        title={t("resendInvite")}
        description={t("confirmResend", { email: selected?.email || "" })}
        confirmLabel={t("resendInvite")}
        cancelLabel={t("cancel")}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!selected) return;
          runMutation(async () => resendAdminInviteAction(selected.id), t("inviteResent"));
        }}
      />

      <ConfirmDialog
        open={confirm === "delete" && Boolean(selected)}
        title={t("deleteUser")}
        description={t("confirmDeleteUser", {
          name: selected?.full_name || selected?.email || "",
          email: selected?.email || "",
          role: (selected?.roles ?? []).join(", ") || "unassigned",
        })}
        confirmLabel={t("deleteUser")}
        cancelLabel={t("cancel")}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!selected) return;
          runMutation(async () => deleteAdminUserAction(selected.id), t("userDeleted"));
        }}
      />
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={
        danger
          ? "block w-full px-3 py-2 text-start text-sm text-[var(--warning)] hover:bg-[var(--muted)]"
          : "block w-full px-3 py-2 text-start text-sm text-[var(--primary)] hover:bg-[var(--muted)]"
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function InviteFields({
  roles,
  commonEmail,
  fullNameLabel,
  assignRoleLabel,
}: {
  roles: AdminRole[];
  commonEmail: string;
  fullNameLabel: string;
  assignRoleLabel: string;
}) {
  return (
    <>
      <div>
        <Label htmlFor="invite-email">{commonEmail}</Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="user@example.com"
        />
      </div>
      <div>
        <Label htmlFor="invite-name">{fullNameLabel}</Label>
        <Input id="invite-name" name="full_name" required minLength={2} maxLength={120} />
      </div>
      <div>
        <Label htmlFor="invite-role">{assignRoleLabel}</Label>
        <select
          id="invite-role"
          name="role_id"
          required
          className="flex h-11 w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 text-sm dark:bg-[var(--surface)]"
          defaultValue={roles[0]?.id ?? ""}
        >
          {roles.length === 0 ? (
            <option value="" disabled>
              No roles available
            </option>
          ) : (
            roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} ({role.slug})
              </option>
            ))
          )}
        </select>
      </div>
    </>
  );
}

function FormActions({
  pending,
  cancelLabel,
  submitLabel,
  loadingLabel,
  onCancel,
  disabled,
}: {
  pending: boolean;
  cancelLabel: string;
  submitLabel: string;
  loadingLabel: string;
  onCancel: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
        {cancelLabel}
      </Button>
      <Button type="submit" variant="accent" disabled={pending || disabled}>
        {pending ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}
