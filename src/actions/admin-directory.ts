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
