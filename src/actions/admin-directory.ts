"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { requirePermission, requireAdminAccess, writeAuditLog } from "@/lib/permissions";
import { DatabaseError, toActionError, ValidationError } from "@/domain/shared/errors";

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
    if (ids.length) {
      const { data: userRoles, error: urError } = await admin
        .from("user_roles")
        .select("user_id, roles(slug, name)")
        .in("user_id", ids);
      if (urError) throw new DatabaseError(urError.message, urError);
      for (const row of userRoles ?? []) {
        const role = row.roles as unknown as { slug: string; name: string } | null;
        if (!role) continue;
        const list = roleByUser.get(row.user_id) ?? [];
        list.push(role.slug);
        roleByUser.set(row.user_id, list);
      }
    }

    return {
      ok: true as const,
      data: (profiles ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        is_active: p.is_active,
        last_login_at: p.last_login_at,
        roles: roleByUser.get(p.id) ?? [],
      })),
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
  try {
    const { userId } = await requirePermission("users.manage");
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const fullName = String(formData.get("full_name") ?? "").trim();
    const roleId = String(formData.get("role_id") ?? "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError("A valid email is required");
    }
    if (fullName.length < 2 || fullName.length > 120) {
      throw new ValidationError("full_name must be 2–120 characters");
    }
    if (!roleId) throw new ValidationError("role_id is required");

    const admin = createAdminClient();
    const { data: role, error: roleError } = await admin
      .from("roles")
      .select("id, slug, is_system")
      .eq("id", roleId)
      .is("deleted_at", null)
      .maybeSingle();
    if (roleError) throw new DatabaseError(roleError.message, roleError);
    if (!role) throw new ValidationError("Role not found");

    const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mastertouchksa.com").replace(/\/$/, "");
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${base}/ar/login`,
    });
    if (inviteError) throw new DatabaseError(inviteError.message, inviteError);
    const newUserId = invited.user?.id;
    if (!newUserId) throw new DatabaseError("Invite succeeded but no user id was returned");

    // Profile row is created by handle_new_user trigger; ensure name + role.
    await admin.from("profiles").update({ full_name: fullName, is_active: true }).eq("id", newUserId);
    const { error: urError } = await admin.from("user_roles").insert({
      user_id: newUserId,
      role_id: roleId,
      created_by: userId,
    });
    if (urError) throw new DatabaseError(urError.message, urError);

    await writeAuditLog("users.invite", "profiles", newUserId, {
      email,
      roleId,
      roleSlug: role.slug,
    });
    revalidatePath("/admin/users");
    return { ok: true as const, data: { userId: newUserId } };
  } catch (error) {
    return toActionError(error);
  }
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
