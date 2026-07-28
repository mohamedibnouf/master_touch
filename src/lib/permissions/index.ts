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

  const { data: isSa, error: saError } = await supabase.rpc("is_super_admin", {
    p_user_id: user.id,
  });
  if (saError) throw new DatabaseError(saError.message, saError);
  if (isSa) return ["*"];

  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("role_id, roles(role_permissions(permissions(key)))")
    .eq("user_id", user.id);

  if (error) throw new DatabaseError(error.message, error);

  const keys = new Set<string>();
  for (const row of roles ?? []) {
    const role = row.roles as unknown as {
      role_permissions: Array<{ permissions: { key: string } | null }>;
    } | null;
    for (const rp of role?.role_permissions ?? []) {
      if (rp.permissions?.key) keys.add(rp.permissions.key);
    }
  }
  return Array.from(keys);
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
