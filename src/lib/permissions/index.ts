import { createClient, requireAuthUser } from "@/infrastructure/supabase/server";
import {
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
} from "@/domain/shared/errors";
import { rbacPolicy } from "@/domain/rbac/policy";
import { logger } from "@/infrastructure/logging/logger";
import { createAdminClient } from "@/infrastructure/supabase/admin";

export async function getCurrentUserPermissions(): Promise<string[]> {
  const { supabase, user } = await requireAuthUser();
  if (!user) throw new AuthenticationError();

  // Prefer SECURITY DEFINER RPC so RLS on RBAC tables cannot empty the set
  const { data: keys, error } = await supabase.rpc("get_my_permission_keys");
  if (!error && Array.isArray(keys)) {
    return keys as string[];
  }

  // Fallback for environments that have not applied migration 00011 yet
  const { data: isSa, error: saError } = await supabase.rpc("is_super_admin", {
    p_user_id: user.id,
  });
  if (saError) throw new DatabaseError(saError.message, saError);
  if (isSa) return ["*"];

  if (error) {
    logger.warn("get_my_permission_keys unavailable; using join fallback", {
      message: error.message,
    });
  }

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role_id, roles(role_permissions(permissions(key)))")
    .eq("user_id", user.id);

  if (rolesError) throw new DatabaseError(rolesError.message, rolesError);

  const set = new Set<string>();
  for (const row of roles ?? []) {
    const role = row.roles as unknown as {
      role_permissions: Array<{ permissions: { key: string } | null }>;
    } | null;
    for (const rp of role?.role_permissions ?? []) {
      if (rp.permissions?.key) set.add(rp.permissions.key);
    }
  }
  return Array.from(set);
}

export function can(permissions: string[], permissionKey: string): boolean {
  return rbacPolicy.can(permissions, permissionKey);
}

/**
 * Centralized authorization gate — call at the start of every privileged Server Action.
 */
export async function requirePermission(permissionKey: string): Promise<{
  userId: string;
  permissions: string[];
}> {
  const { user } = await requireAuthUser();
  if (!user) throw new AuthenticationError();

  const permissions = await getCurrentUserPermissions();
  if (!can(permissions, permissionKey)) {
    logger.audit("authorization.denied", { userId: user.id, permissionKey });
    throw new AuthorizationError(`Missing permission: ${permissionKey}`);
  }

  return { userId: user.id, permissions };
}

/** Admin layout / middleware: any authenticated user with dashboard access (or CMS module). */
export async function requireAdminAccess(): Promise<{
  userId: string;
  permissions: string[];
  email: string | null;
}> {
  const { supabase, user } = await requireAuthUser();
  if (!user) throw new AuthenticationError();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && profile.is_active === false) {
    throw new AuthorizationError("Account is inactive");
  }

  const permissions = await getCurrentUserPermissions();
  const allowed =
    can(permissions, "dashboard.view") ||
    can(permissions, "homepage.view") ||
    can(permissions, "about.view") ||
    can(permissions, "services.view") ||
    can(permissions, "contact.view") ||
    can(permissions, "media.view") ||
    can(permissions, "theme.view") ||
    can(permissions, "settings.view") ||
    can(permissions, "translations.view") ||
    can(permissions, "users.view") ||
    can(permissions, "roles.view");

  if (!allowed) {
    logger.audit("authorization.denied", { userId: user.id, permissionKey: "admin.access" });
    throw new AuthorizationError("Missing admin access");
  }

  return { userId: user.id, permissions, email: profile?.email ?? user.email ?? null };
}

export async function writeAuditLog(
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    const admin = createAdminClient();
    let actorId: string | null = null;
    try {
      const { user } = await requireAuthUser();
      actorId = user?.id ?? null;
    } catch {
      actorId = null;
    }

    await admin.from("audit_logs").insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata: metadata ?? {},
    });
    logger.audit(action, { entityType, entityId, actorId, ...metadata });
  } catch (error) {
    logger.error("Failed to write audit log", { error, action, entityType });
  }
}

/** Used by middleware / layouts when only a boolean is needed. */
export async function hasSession(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}

/** Safe post-login redirect: relative /admin paths only. */
export function safeAdminNextPath(next: string | undefined | null): string {
  if (!next || typeof next !== "string") return "/admin";
  if (!next.startsWith("/admin")) return "/admin";
  if (next.startsWith("//") || next.includes("\\") || next.includes("://")) return "/admin";
  return next;
}
