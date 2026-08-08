"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { requireSuperAdmin, writeAuditLog } from "@/lib/permissions";
import {
  ConfigurationError,
  DatabaseError,
  isAppError,
  ValidationError,
} from "@/domain/shared/errors";
import { logger } from "@/infrastructure/logging/logger";

const LAST_SUPER_ADMIN_AR = "لا يمكن حذف أو تعطيل آخر مدير نظام.";

type ManageFailStep =
  | "permissionCheck"
  | "validateInput"
  | "createAdminClient"
  | "loadTarget"
  | "loadRole"
  | "superAdminGuard"
  | "updateProfile"
  | "updateAuthEmail"
  | "roleAssignment"
  | "disableUser"
  | "enableUser"
  | "resendInvitation"
  | "inviteEmail"
  | "nullifyReferences"
  | "deleteAuthUser";

type ManageActionResult =
  | { ok: true; data?: Record<string, unknown> }
  | {
      ok: false;
      step: ManageFailStep;
      error: string;
      code: string;
      status: number;
      errorName?: string;
      errorMessage?: string;
      errorCode?: string;
      errorStatus?: number;
      errorDescription?: string;
      stack?: string;
    };

type ManageFail = Extract<ManageActionResult, { ok: false }>;

type AdminClientOk = {
  ok: true;
  admin: ReturnType<typeof createAdminClient>;
};

type TargetProfileOk = {
  ok: true;
  profile: { id: string; email: string; full_name: string | null; is_active: boolean };
};

function extractErrorFields(error: unknown): {
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
  if (typeof error === "string") return { errorMessage: asString(error) };
  if (typeof error !== "object") return { errorMessage: asString(String(error)) };

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

function failAt(step: ManageFailStep, error: unknown, fallback: string): ManageFail {
  const isDev = process.env.NODE_ENV !== "production";
  const fields = extractErrorFields(error);
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
    fields.errorStatus ?? (isAppError(error) ? error.status : undefined) ?? 502;

  logger.error("admin user management failed", {
    step,
    errorName: fields.errorName,
    errorMessage: fields.errorMessage,
    errorCode: fields.errorCode,
    errorStatus: fields.errorStatus,
    resolvedMessage: message,
    resolvedCode: code,
  });

  return {
    ok: false,
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
}

function failCode(
  step: ManageFailStep,
  message: string,
  code: string,
  status = 400,
): ManageFail {
  return { ok: false, step, error: message, code, status };
}

function getAdminClientOrFail(): AdminClientOk | ManageFail {
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
  try {
    return { ok: true, admin: createAdminClient() };
  } catch (error) {
    return failAt("createAdminClient", error, "Failed to create Supabase service-role client");
  }
}

async function loadTargetProfile(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<TargetProfileOk | ManageFail> {
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, full_name, is_active")
    .eq("id", userId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) return failAt("loadTarget", error, "Failed to load user");
  if (!data) return failCode("loadTarget", "User not found", "NOT_FOUND", 404);
  return { ok: true, profile: data };
}

async function userIsSuperAdmin(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<boolean> {
  const { data, error } = await admin.rpc("is_super_admin", { p_user_id: userId });
  if (error) throw new DatabaseError(error.message, error);
  return Boolean(data);
}

async function countActiveSuperAdmins(admin: ReturnType<typeof createAdminClient>): Promise<number> {
  const { data: role, error: roleError } = await admin
    .from("roles")
    .select("id")
    .eq("slug", "super_admin")
    .is("deleted_at", null)
    .maybeSingle();
  if (roleError) throw new DatabaseError(roleError.message, roleError);
  if (!role) return 0;

  const { data: assignments, error } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role_id", role.id);
  if (error) throw new DatabaseError(error.message, error);
  const userIds = [...new Set((assignments ?? []).map((row) => row.user_id))];
  if (!userIds.length) return 0;

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id")
    .in("id", userIds)
    .is("deleted_at", null)
    .eq("is_active", true);
  if (profileError) throw new DatabaseError(profileError.message, profileError);
  return profiles?.length ?? 0;
}

/** Reject delete/disable/demote when target is the last active Super Admin. */
async function assertNotLastSuperAdminAction(
  admin: ReturnType<typeof createAdminClient>,
  targetUserId: string,
  step: ManageFailStep,
): Promise<ManageFail | null> {
  const isSa = await userIsSuperAdmin(admin, targetUserId);
  if (!isSa) return null;
  const count = await countActiveSuperAdmins(admin);
  if (count <= 1) {
    return failCode(step, LAST_SUPER_ADMIN_AR, "LAST_SUPER_ADMIN", 400);
  }
  return null;
}

/**
 * Profile FKs use NO ACTION / omit ON DELETE — null them before auth.admin.deleteUser
 * so CASCADE (auth.users → profiles → user_roles.user_id) can complete.
 */
async function nullifyProfileForeignKeys(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<void> {
  const updates: Array<PromiseLike<{ error: { message: string } | null }>> = [
    admin.from("roles").update({ created_by: null }).eq("created_by", userId),
    admin.from("roles").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("role_permissions").update({ created_by: null }).eq("created_by", userId),
    admin.from("user_roles").update({ created_by: null }).eq("created_by", userId),
    admin.from("pages").update({ created_by: null }).eq("created_by", userId),
    admin.from("pages").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("translations").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("audit_logs").update({ actor_id: null }).eq("actor_id", userId),
    admin.from("homepage_sections").update({ created_by: null }).eq("created_by", userId),
    admin.from("homepage_sections").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("homepage_slides").update({ created_by: null }).eq("created_by", userId),
    admin.from("homepage_slides").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("about_pages").update({ created_by: null }).eq("created_by", userId),
    admin.from("about_pages").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("services").update({ created_by: null }).eq("created_by", userId),
    admin.from("services").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("contact_settings").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("contact_messages").update({ assigned_to: null }).eq("assigned_to", userId),
    admin.from("media_folders").update({ created_by: null }).eq("created_by", userId),
    admin.from("media_folders").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("media_assets").update({ created_by: null }).eq("created_by", userId),
    admin.from("media_assets").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("theme_settings").update({ updated_by: null }).eq("updated_by", userId),
    admin.from("site_settings").update({ updated_by: null }).eq("updated_by", userId),
  ];

  const results = await Promise.all(updates);
  for (const result of results) {
    if (result.error) {
      throw new DatabaseError(result.error.message, result.error);
    }
  }
}

async function replaceUserRole(
  admin: ReturnType<typeof createAdminClient>,
  actorId: string,
  targetUserId: string,
  roleId: string,
): Promise<{ slug: string }> {
  const { data: role, error: roleError } = await admin
    .from("roles")
    .select("id, slug")
    .eq("id", roleId)
    .is("deleted_at", null)
    .maybeSingle();
  if (roleError) throw new DatabaseError(roleError.message, roleError);
  if (!role) throw new ValidationError("Role not found");

  const { error: delError } = await admin.from("user_roles").delete().eq("user_id", targetUserId);
  if (delError) throw new DatabaseError(delError.message, delError);

  const { error: insError } = await admin.from("user_roles").insert({
    user_id: targetUserId,
    role_id: roleId,
    created_by: actorId,
  });
  if (insError) throw new DatabaseError(insError.message, insError);
  return { slug: role.slug };
}

export async function updateAdminUserAction(formData: FormData): Promise<ManageActionResult> {
  let actorId: string;
  try {
    ({ userId: actorId } = await requireSuperAdmin());
  } catch (error) {
    return failAt("permissionCheck", error, "Super Admin required");
  }

  const targetUserId = String(formData.get("user_id") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleId = String(formData.get("role_id") ?? "").trim();

  if (!targetUserId) {
    return failAt("validateInput", new ValidationError("user_id is required"), "user_id is required");
  }
  if (fullName.length < 2 || fullName.length > 120) {
    return failAt(
      "validateInput",
      new ValidationError("full_name must be 2–120 characters"),
      "full_name must be 2–120 characters",
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return failAt("validateInput", new ValidationError("A valid email is required"), "A valid email is required");
  }
  if (!roleId) {
    return failAt("validateInput", new ValidationError("role_id is required"), "role_id is required");
  }

  const client = getAdminClientOrFail();
  if (!client.ok) return client;
  const { admin } = client;

  const target = await loadTargetProfile(admin, targetUserId);
  if (!target.ok) return target;

  let nextRoleSlug: string;
  try {
    const { data: nextRole, error: roleError } = await admin
      .from("roles")
      .select("id, slug")
      .eq("id", roleId)
      .is("deleted_at", null)
      .maybeSingle();
    if (roleError) return failAt("loadRole", roleError, "Failed to load role");
    if (!nextRole) return failAt("loadRole", new ValidationError("Role not found"), "Role not found");
    nextRoleSlug = nextRole.slug;

    const currentlySa = await userIsSuperAdmin(admin, targetUserId);
    if (currentlySa && nextRole.slug !== "super_admin") {
      const blocked = await assertNotLastSuperAdminAction(admin, targetUserId, "superAdminGuard");
      if (blocked) return blocked;
      if (actorId === targetUserId) {
        const count = await countActiveSuperAdmins(admin);
        if (count <= 1) {
          return failCode("superAdminGuard", LAST_SUPER_ADMIN_AR, "LAST_SUPER_ADMIN", 400);
        }
      }
    }
  } catch (error) {
    return failAt("loadRole", error, "Failed to load role");
  }

  if (email !== target.profile.email.toLowerCase()) {
    try {
      const { error: authError } = await admin.auth.admin.updateUserById(targetUserId, {
        email,
        // Do NOT set email_confirm — preserve confirmation semantics.
      });
      if (authError) {
        return failAt("updateAuthEmail", authError, "Failed to update Auth email");
      }
    } catch (error) {
      return failAt("updateAuthEmail", error, "Failed to update Auth email");
    }
  }

  try {
    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: fullName, email, updated_by: actorId })
      .eq("id", targetUserId);
    if (profileError) return failAt("updateProfile", profileError, "Failed to update profile");
  } catch (error) {
    return failAt("updateProfile", error, "Failed to update profile");
  }

  try {
    await replaceUserRole(admin, actorId, targetUserId, roleId);
  } catch (error) {
    return failAt("roleAssignment", error, "Failed to update user role");
  }

  await writeAuditLog("users.update", "profiles", targetUserId, {
    fullName,
    email,
    roleId,
    roleSlug: nextRoleSlug,
  });
  revalidatePath("/admin/users");
  return { ok: true, data: { userId: targetUserId } };
}

export async function changeAdminUserRoleAction(formData: FormData): Promise<ManageActionResult> {
  let actorId: string;
  try {
    ({ userId: actorId } = await requireSuperAdmin());
  } catch (error) {
    return failAt("permissionCheck", error, "Super Admin required");
  }

  const targetUserId = String(formData.get("user_id") ?? "").trim();
  const roleId = String(formData.get("role_id") ?? "").trim();
  if (!targetUserId || !roleId) {
    return failAt("validateInput", new ValidationError("user_id and role_id are required"), "user_id and role_id are required");
  }

  const client = getAdminClientOrFail();
  if (!client.ok) return client;
  const { admin } = client;

  const target = await loadTargetProfile(admin, targetUserId);
  if (!target.ok) return target;

  try {
    const { data: nextRole, error: roleError } = await admin
      .from("roles")
      .select("id, slug")
      .eq("id", roleId)
      .is("deleted_at", null)
      .maybeSingle();
    if (roleError) return failAt("loadRole", roleError, "Failed to load role");
    if (!nextRole) return failAt("loadRole", new ValidationError("Role not found"), "Role not found");

    const currentlySa = await userIsSuperAdmin(admin, targetUserId);
    if (currentlySa && nextRole.slug !== "super_admin") {
      const blocked = await assertNotLastSuperAdminAction(admin, targetUserId, "superAdminGuard");
      if (blocked) return blocked;
    }

    await replaceUserRole(admin, actorId, targetUserId, roleId);
    await writeAuditLog("users.role_change", "profiles", targetUserId, {
      roleId,
      roleSlug: nextRole.slug,
    });
  } catch (error) {
    return failAt("roleAssignment", error, "Failed to change user role");
  }

  revalidatePath("/admin/users");
  return { ok: true, data: { userId: targetUserId } };
}

export async function disableAdminUserAction(userId: string): Promise<ManageActionResult> {
  let actorId: string;
  try {
    ({ userId: actorId } = await requireSuperAdmin());
  } catch (error) {
    return failAt("permissionCheck", error, "Super Admin required");
  }

  const targetUserId = String(userId ?? "").trim();
  if (!targetUserId) {
    return failAt("validateInput", new ValidationError("user_id is required"), "user_id is required");
  }
  if (actorId === targetUserId) {
    return failCode("superAdminGuard", "لا يمكن تعطيل حسابك الحالي.", "SELF_DISABLE", 400);
  }

  const client = getAdminClientOrFail();
  if (!client.ok) return client;
  const { admin } = client;

  const target = await loadTargetProfile(admin, targetUserId);
  if (!target.ok) return target;

  try {
    const blocked = await assertNotLastSuperAdminAction(admin, targetUserId, "superAdminGuard");
    if (blocked) return blocked;

    const { error } = await admin
      .from("profiles")
      .update({ is_active: false, updated_by: actorId })
      .eq("id", targetUserId);
    if (error) return failAt("disableUser", error, "Failed to disable user");
  } catch (error) {
    return failAt("disableUser", error, "Failed to disable user");
  }

  await writeAuditLog("users.disable", "profiles", targetUserId, {});
  revalidatePath("/admin/users");
  return { ok: true, data: { userId: targetUserId } };
}

export async function enableAdminUserAction(userId: string): Promise<ManageActionResult> {
  let actorId: string;
  try {
    ({ userId: actorId } = await requireSuperAdmin());
  } catch (error) {
    return failAt("permissionCheck", error, "Super Admin required");
  }

  const targetUserId = String(userId ?? "").trim();
  if (!targetUserId) {
    return failAt("validateInput", new ValidationError("user_id is required"), "user_id is required");
  }

  const client = getAdminClientOrFail();
  if (!client.ok) return client;
  const { admin } = client;

  const target = await loadTargetProfile(admin, targetUserId);
  if (!target.ok) return target;

  try {
    // Enable only — do not confirm email / alter Auth confirmation.
    const { error } = await admin
      .from("profiles")
      .update({ is_active: true, updated_by: actorId })
      .eq("id", targetUserId);
    if (error) return failAt("enableUser", error, "Failed to enable user");
  } catch (error) {
    return failAt("enableUser", error, "Failed to enable user");
  }

  await writeAuditLog("users.enable", "profiles", targetUserId, {});
  revalidatePath("/admin/users");
  return { ok: true, data: { userId: targetUserId } };
}

export async function resendAdminInviteAction(userId: string): Promise<ManageActionResult> {
  try {
    await requireSuperAdmin();
  } catch (error) {
    return failAt("permissionCheck", error, "Super Admin required");
  }

  const targetUserId = String(userId ?? "").trim();
  if (!targetUserId) {
    return failAt("validateInput", new ValidationError("user_id is required"), "user_id is required");
  }

  const client = getAdminClientOrFail();
  if (!client.ok) return client;
  const { admin } = client;

  const target = await loadTargetProfile(admin, targetUserId);
  if (!target.ok) return target;

  try {
    const { data: authData, error: authError } = await admin.auth.admin.getUserById(targetUserId);
    if (authError) return failAt("resendInvitation", authError, "Failed to load Auth user");
    const authUser = authData?.user;
    if (!authUser) return failCode("resendInvitation", "Auth user not found", "NOT_FOUND", 404);
    if (authUser.email_confirmed_at || authUser.confirmed_at) {
      return failCode(
        "resendInvitation",
        "User already confirmed; invitation cannot be resent",
        "ALREADY_CONFIRMED",
        400,
      );
    }

    const email = (authUser.email || target.profile.email).toLowerCase();
    const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mastertouchksa.com").replace(/\/$/, "");
    const inviteRedirectTo = `${base}/ar/reset-password`;

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: target.profile.full_name ?? undefined,
      },
      redirectTo: inviteRedirectTo,
    });
    if (inviteError) {
      return failAt("resendInvitation", inviteError, "Failed to resend invitation email");
    }

    const invitedId = invited?.user?.id ?? targetUserId;
    const { data: refreshed, error: refreshError } = await admin.auth.admin.getUserById(invitedId);
    if (refreshError) {
      return failAt(
        "inviteEmail",
        refreshError,
        "User exists but invitation email status could not be verified",
      );
    }
    const mailUser = refreshed?.user ?? invited?.user;
    const invitationQueued = Boolean(mailUser?.invited_at || mailUser?.confirmation_sent_at);
    logger.info("resendAdminInviteAction result", {
      userId: targetUserId,
      email,
      invited_at: mailUser?.invited_at ?? null,
      confirmation_sent_at: mailUser?.confirmation_sent_at ?? null,
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
    return failAt("resendInvitation", error, "Failed to resend invitation");
  }

  await writeAuditLog("users.invite_resend", "profiles", targetUserId, {
    email: target.profile.email,
  });
  revalidatePath("/admin/users");
  return { ok: true, data: { userId: targetUserId } };
}

export async function deleteAdminUserAction(userId: string): Promise<ManageActionResult> {
  let actorId: string;
  try {
    ({ userId: actorId } = await requireSuperAdmin());
  } catch (error) {
    return failAt("permissionCheck", error, "Super Admin required");
  }

  const targetUserId = String(userId ?? "").trim();
  if (!targetUserId) {
    return failAt("validateInput", new ValidationError("user_id is required"), "user_id is required");
  }
  if (actorId === targetUserId) {
    return failCode("superAdminGuard", "لا يمكن حذف حسابك الحالي.", "SELF_DELETE", 400);
  }

  const client = getAdminClientOrFail();
  if (!client.ok) return client;
  const { admin } = client;

  const target = await loadTargetProfile(admin, targetUserId);
  if (!target.ok) return target;

  try {
    const blocked = await assertNotLastSuperAdminAction(admin, targetUserId, "superAdminGuard");
    if (blocked) return blocked;
  } catch (error) {
    return failAt("superAdminGuard", error, LAST_SUPER_ADMIN_AR);
  }

  try {
    await nullifyProfileForeignKeys(admin, targetUserId);
  } catch (error) {
    return failAt("nullifyReferences", error, "Failed to clear related references before delete");
  }

  try {
    const { error: deleteError } = await admin.auth.admin.deleteUser(targetUserId);
    if (deleteError) {
      return failAt("deleteAuthUser", deleteError, "Failed to delete Auth user");
    }
  } catch (error) {
    return failAt("deleteAuthUser", error, "Failed to delete Auth user");
  }

  await writeAuditLog("users.delete", "profiles", targetUserId, {
    email: target.profile.email,
    fullName: target.profile.full_name,
  });
  revalidatePath("/admin/users");
  return { ok: true, data: { userId: targetUserId } };
}
