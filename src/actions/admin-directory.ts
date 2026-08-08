"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { requirePermission, requireAdminAccess, writeAuditLog } from "@/lib/permissions";
import {
  ConfigurationError,
  DatabaseError,
  isAppError,
  toActionError,
  ValidationError,
} from "@/domain/shared/errors";
import { logger } from "@/infrastructure/logging/logger";

/** Admin UI lifecycle — not the same as profiles.is_active (account enabled flag). */
export type AdminUserStatus = "pending" | "active" | "disabled";

type AuthLifecycleFields = {
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  invited_at?: string | null;
  confirmation_sent_at?: string | null;
  last_sign_in_at?: string | null;
  banned_until?: string | null;
};

function resolveAdminUserStatus(
  profileActive: boolean,
  auth: AuthLifecycleFields | undefined,
): AdminUserStatus {
  if (!profileActive) return "disabled";
  if (auth?.banned_until) {
    const until = Date.parse(auth.banned_until);
    if (!Number.isNaN(until) && until > Date.now()) return "disabled";
  }
  // Existence in Auth ≠ active. Invited users stay pending until confirmation.
  if (auth?.email_confirmed_at || auth?.confirmed_at) return "active";
  return "pending";
}

async function loadAuthLifecycleByUserId(
  admin: ReturnType<typeof createAdminClient>,
  userIds: string[],
): Promise<Map<string, AuthLifecycleFields>> {
  const map = new Map<string, AuthLifecycleFields>();
  if (!userIds.length) return map;

  const wanted = new Set(userIds);
  let page = 1;
  const perPage = 200;
  // Cap pages so a huge Auth directory cannot stall the users list.
  for (let i = 0; i < 10 && wanted.size > 0; i += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new DatabaseError(error.message, error);
    const users = data?.users ?? [];
    for (const u of users) {
      if (!wanted.has(u.id)) continue;
      map.set(u.id, {
        email_confirmed_at: u.email_confirmed_at ?? null,
        confirmed_at: u.confirmed_at ?? null,
        invited_at: u.invited_at ?? null,
        confirmation_sent_at: u.confirmation_sent_at ?? null,
        last_sign_in_at: u.last_sign_in_at ?? null,
        banned_until: u.banned_until ?? null,
      });
      wanted.delete(u.id);
    }
    if (users.length < perPage) break;
    page += 1;
  }
  return map;
}

export async function listAdminUsersAction() {
  try {
    await requirePermission("users.view");
    const admin = createAdminClient();
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id, email, full_name, is_active, last_login_at, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new DatabaseError(error.message, error);

    const ids = (profiles ?? []).map((p) => p.id);
    const roleByUser = new Map<string, string[]>();
    const roleIdsByUser = new Map<string, string[]>();
    if (ids.length) {
      const { data: userRoles, error: urError } = await admin
        .from("user_roles")
        .select("user_id, role_id, roles(slug)")
        .in("user_id", ids);
      if (urError) throw new DatabaseError(urError.message, urError);
      for (const row of userRoles ?? []) {
        const role = row.roles as unknown as { slug: string } | null;
        if (!role?.slug) continue;
        const list = roleByUser.get(row.user_id) ?? [];
        list.push(role.slug);
        roleByUser.set(row.user_id, list);
        const idList = roleIdsByUser.get(row.user_id) ?? [];
        idList.push(row.role_id);
        roleIdsByUser.set(row.user_id, idList);
      }
    }

    const authById = await loadAuthLifecycleByUserId(admin, ids);

    return {
      ok: true as const,
      data: (profiles ?? []).map((p) => {
        const auth = authById.get(p.id);
        const status = resolveAdminUserStatus(p.is_active !== false, auth);
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          is_active: p.is_active,
          status,
          last_login_at: p.last_login_at,
          roles: roleByUser.get(p.id) ?? [],
          role_ids: roleIdsByUser.get(p.id) ?? [],
        };
      }),
    };
  } catch (error) {
    return { ...toActionError(error), data: [] as const };
  }
}

export async function listAdminRolesAction() {
  try {
    await requirePermission("roles.view");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("roles")
      .select("id, slug, name_i18n, description_i18n, is_system, sort_order")
      .is("deleted_at", null)
      .order("sort_order")
      .limit(100);
    if (error) throw new DatabaseError(error.message, error);
    return {
      ok: true as const,
      data: (data ?? []).map((r) => {
        const nameI18n = (r.name_i18n ?? {}) as Record<string, string>;
        const descI18n = (r.description_i18n ?? {}) as Record<string, string>;
        return {
          id: r.id,
          slug: r.slug,
          name: nameI18n.en || nameI18n.ar || r.slug,
          description: descI18n.en || descI18n.ar || null,
          is_system: r.is_system,
        };
      }),
    };
  } catch (error) {
    return { ...toActionError(error), data: [] as const };
  }
}

export async function getDashboardStatsAction() {
  try {
    await requireAdminAccess();
    const admin = createAdminClient();
    const [messages, services, media, recent] = await Promise.all([
      admin.from("contact_messages").select("id", { count: "exact", head: true }).is("deleted_at", null),
      admin.from("services").select("id", { count: "exact", head: true }).is("deleted_at", null),
      admin.from("media_assets").select("id", { count: "exact", head: true }).is("deleted_at", null),
      admin
        .from("audit_logs")
        .select("id, action, entity_type, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    if (messages.error) throw new DatabaseError(messages.error.message, messages.error);
    if (services.error) throw new DatabaseError(services.error.message, services.error);
    if (media.error) throw new DatabaseError(media.error.message, media.error);
    if (recent.error) throw new DatabaseError(recent.error.message, recent.error);

    return {
      ok: true as const,
      data: {
        messages: messages.count ?? 0,
        services: services.count ?? 0,
        media: media.count ?? 0,
        recent: recent.data ?? [],
      },
    };
  } catch (error) {
    return {
      ...toActionError(error),
      data: { messages: 0, services: 0, media: 0, recent: [] as const },
    };
  }
}

export async function updateOwnProfileAction(formData: FormData) {
  try {
    const { userId } = await requireAdminAccess();
    const fullName = String(formData.get("full_name") ?? "").trim();
    if (fullName.length < 2 || fullName.length > 120) {
      throw new ValidationError("full_name must be 2–120 characters");
    }
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId)
      .is("deleted_at", null);
    if (error) throw new DatabaseError(error.message, error);
    await writeAuditLog("profile.update", "profiles", userId);
    revalidatePath("/admin/profile");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function getOwnProfileAction() {
  try {
    const { userId, email } = await requireAdminAccess();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("id, email, full_name, is_active")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new DatabaseError(error.message, error);
    return {
      ok: true as const,
      data: {
        id: userId,
        email: data?.email ?? email,
        full_name: data?.full_name ?? "",
        is_active: data?.is_active ?? true,
      },
    };
  } catch (error) {
    return {
      ...toActionError(error),
      data: null,
    };
  }
}

export async function inviteAdminUserAction(formData: FormData) {
  const isDev = process.env.NODE_ENV !== "production";

  const failAt = (step: InviteFailStep, error: unknown, fallback: string) => {
    const fields = extractInviteErrorFields(error);
    const message =
      fields.errorMessage ||
      fields.errorDescription ||
      fields.details ||
      (isAppError(error) && error.message && error.message !== "{}" ? error.message : null) ||
      fallback;
    const code =
      fields.errorCode ||
      (isAppError(error) ? String(error.code) : null) ||
      "EXTERNAL_SERVICE";
    const status =
      fields.errorStatus ??
      (isAppError(error) ? error.status : undefined) ??
      502;

    logger.error("inviteAdminUserAction failed", {
      step,
      errorName: fields.errorName,
      errorMessage: fields.errorMessage,
      errorCode: fields.errorCode,
      errorStatus: fields.errorStatus,
      errorDescription: fields.errorDescription,
      details: fields.details,
      resolvedMessage: message,
      resolvedCode: code,
      resolvedStatus: status,
    });

    return {
      ok: false as const,
      step,
      error: message,
      code,
      status,
      errorName: fields.errorName,
      errorMessage: fields.errorMessage,
      errorCode: fields.errorCode,
      errorStatus: fields.errorStatus,
      errorDescription: fields.errorDescription,
      ...(isDev && fields.stack ? { stack: fields.stack } : {}),
    };
  };

  let userId: string;
  try {
    ({ userId } = await requirePermission("users.manage"));
  } catch (error) {
    return failAt("permissionCheck", error, "Permission check failed");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const roleId = String(formData.get("role_id") ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return failAt("validateInput", new ValidationError("A valid email is required"), "A valid email is required");
  }
  if (fullName.length < 2 || fullName.length > 120) {
    return failAt(
      "validateInput",
      new ValidationError("full_name must be 2–120 characters"),
      "full_name must be 2–120 characters",
    );
  }
  if (!roleId) {
    return failAt("validateInput", new ValidationError("role_id is required"), "role_id is required");
  }

  const serviceRoleConfigured = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your_service_role"),
  );
  if (!serviceRoleConfigured) {
    return failAt(
      "createAdminClient",
      new ConfigurationError("SUPABASE_SERVICE_ROLE_KEY is missing or placeholder"),
      "SUPABASE_SERVICE_ROLE_KEY is missing or placeholder",
    );
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (error) {
    return failAt("createAdminClient", error, "Failed to create Supabase service-role client");
  }

  let role: { id: string; slug: string; is_system: boolean };
  try {
    const { data, error: roleError } = await admin
      .from("roles")
      .select("id, slug, is_system")
      .eq("id", roleId)
      .is("deleted_at", null)
      .maybeSingle();
    if (roleError) {
      return failAt("loadRole", roleError, "Failed to load role for invite");
    }
    if (!data) {
      return failAt("loadRole", new ValidationError("Role not found"), "Role not found");
    }
    role = data;
  } catch (error) {
    return failAt("loadRole", error, "Failed to load role for invite");
  }

  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mastertouchksa.com").replace(/\/$/, "");
  // Prefer reset-password (documented Auth redirect allowlist) so invitees can set a password.
  const inviteRedirectTo = `${base}/ar/reset-password`;
  let newUserId: string;
  try {
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: inviteRedirectTo,
    });
    if (inviteError) {
      return failAt(
        "inviteUserByEmail",
        inviteError,
        "auth.admin.inviteUserByEmail failed (check Auth SMTP / service role / redirect URL)",
      );
    }
    if (!invited?.user?.id) {
      return failAt(
        "inviteUserByEmail",
        new DatabaseError("Invite succeeded but no user id was returned"),
        "Invite succeeded but no user id was returned",
      );
    }
    newUserId = invited.user.id;

    // Re-read Auth user — response may omit mailer timestamps; do not treat create-as-success.
    const { data: refreshed, error: refreshError } = await admin.auth.admin.getUserById(newUserId);
    if (refreshError) {
      return failAt(
        "inviteEmail",
        refreshError,
        "User was created but invitation email status could not be verified",
      );
    }
    const authUser = refreshed?.user ?? invited.user;
    const invitationQueued = Boolean(authUser.invited_at || authUser.confirmation_sent_at);

    logger.info("inviteAdminUserAction auth invite result", {
      step: "inviteUserByEmail",
      userId: newUserId,
      email,
      redirectTo: inviteRedirectTo,
      invited_at: authUser.invited_at ?? null,
      confirmation_sent_at: authUser.confirmation_sent_at ?? null,
      email_confirmed_at: authUser.email_confirmed_at ?? null,
      confirmed_at: authUser.confirmed_at ?? null,
      last_sign_in_at: authUser.last_sign_in_at ?? null,
      invitationQueued,
    });

    if (!invitationQueued) {
      return failAt(
        "inviteEmail",
        new DatabaseError("User was created but invitation email could not be sent"),
        "User was created but invitation email could not be sent",
      );
    }
  } catch (error) {
    return failAt(
      "inviteUserByEmail",
      error,
      "auth.admin.inviteUserByEmail failed (check Auth SMTP / service role / redirect URL)",
    );
  }

  try {
    // Do NOT set is_active / email_confirmed — invited users stay pending until Auth confirms.
    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", newUserId);
    if (profileError) {
      return failAt("profileUpdate", profileError, "Invite created auth user but failed to update profile");
    }
  } catch (error) {
    return failAt("profileUpdate", error, "Invite created auth user but failed to update profile");
  }

  try {
    const { error: urError } = await admin.from("user_roles").insert({
      user_id: newUserId,
      role_id: roleId,
      created_by: userId,
    });
    if (urError) {
      return failAt(
        "roleAssignment",
        urError,
        "Invitation email was sent, but role assignment failed. The user can sign in; assign a role manually.",
      );
    }
  } catch (error) {
    return failAt(
      "roleAssignment",
      error,
      "Invitation email was sent, but role assignment failed. The user can sign in; assign a role manually.",
    );
  }

  try {
    await writeAuditLog("users.invite", "profiles", newUserId, {
      email,
      roleId,
      roleSlug: role.slug,
    });
  } catch (error) {
    logger.warn("invite audit log failed", {
      step: "auditLog",
      ...extractInviteErrorFields(error),
      newUserId,
    });
  }

  revalidatePath("/admin/users");
  return { ok: true as const, data: { userId: newUserId } };
}

type InviteFailStep =
  | "permissionCheck"
  | "validateInput"
  | "createAdminClient"
  | "loadRole"
  | "inviteUserByEmail"
  | "inviteEmail"
  | "profileUpdate"
  | "roleAssignment";

/** Extract Auth/Postgrest fields without JSON.stringify(error) (AuthApiError stringifies to "{}"). */
function extractInviteErrorFields(error: unknown): {
  errorName?: string;
  errorMessage?: string;
  errorCode?: string;
  errorStatus?: number;
  errorDescription?: string;
  details?: string;
  stack?: string;
} {
  const asString = (value: unknown): string | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed || trimmed === "{}" || trimmed === "null" || trimmed === "[object Object]") {
      return undefined;
    }
    return trimmed;
  };

  if (error == null) return {};

  if (typeof error === "string") {
    return { errorMessage: asString(error) };
  }

  if (typeof error !== "object") {
    return { errorMessage: asString(String(error)) };
  }

  const e = error as Record<string, unknown>;
  return {
    errorName: asString(e.name) ?? (error instanceof Error ? asString(error.name) : undefined),
    errorMessage:
      asString(e.message) ?? (error instanceof Error ? asString(error.message) : undefined),
    errorCode: asString(e.code),
    errorStatus: typeof e.status === "number" ? e.status : undefined,
    errorDescription: asString(e.error_description) ?? asString(e.errorDescription),
    details: asString(e.details),
    stack: error instanceof Error ? error.stack : asString(e.stack),
  };
}

export async function listPermissionCatalogAction() {
  try {
    await requirePermission("roles.view");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("permissions")
      .select("id, key, module, action")
      .is("deleted_at", null)
      .order("module")
      .order("key");
    if (error) throw new DatabaseError(error.message, error);
    return {
      ok: true as const,
      data: (data ?? []).map((p) => ({
        id: p.id,
        key: p.key,
        module: p.module,
        action: p.action,
      })),
    };
  } catch (error) {
    return { ...toActionError(error), data: [] as const };
  }
}

export async function getRolePermissionKeysAction(roleId: string) {
  try {
    await requirePermission("roles.view");
    if (!roleId) throw new ValidationError("roleId is required");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("role_permissions")
      .select("permission_id, permissions(key)")
      .eq("role_id", roleId);
    if (error) throw new DatabaseError(error.message, error);
    const keys: string[] = [];
    for (const row of data ?? []) {
      const perm = row.permissions as unknown as { key: string } | null;
      if (perm?.key) keys.push(perm.key);
    }
    return { ok: true as const, data: keys };
  } catch (error) {
    return { ...toActionError(error), data: [] as string[] };
  }
}

export async function setRolePermissionsAction(formData: FormData) {
  try {
    const { userId } = await requirePermission("roles.manage");
    const roleId = String(formData.get("role_id") ?? "").trim();
    if (!roleId) throw new ValidationError("role_id is required");

    const keys = formData
      .getAll("permission_key")
      .map((v) => String(v).trim())
      .filter(Boolean);

    const admin = createAdminClient();
    const { data: role, error: roleError } = await admin
      .from("roles")
      .select("id, slug")
      .eq("id", roleId)
      .is("deleted_at", null)
      .maybeSingle();
    if (roleError) throw new DatabaseError(roleError.message, roleError);
    if (!role) throw new ValidationError("Role not found");

    const { data: perms, error: permError } = keys.length
      ? await admin.from("permissions").select("id, key").is("deleted_at", null).in("key", keys)
      : { data: [] as Array<{ id: string; key: string }>, error: null };
    if (permError) throw new DatabaseError(permError.message, permError);

    const permissionIds = (perms ?? []).map((p) => p.id);

    const { error: delError } = await admin.from("role_permissions").delete().eq("role_id", roleId);
    if (delError) throw new DatabaseError(delError.message, delError);

    if (permissionIds.length) {
      const { error: insError } = await admin.from("role_permissions").insert(
        permissionIds.map((permission_id) => ({
          role_id: roleId,
          permission_id,
          created_by: userId,
        })),
      );
      if (insError) throw new DatabaseError(insError.message, insError);
    }

    await writeAuditLog("roles.permissions.update", "roles", roleId, {
      slug: role.slug,
      keys,
    });
    revalidatePath("/admin/roles");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}
