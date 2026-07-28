"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { themeUpdateSchema } from "@/lib/validations";
import { requirePermission, writeAuditLog } from "@/lib/permissions";
import { toActionError, ValidationError, DatabaseError } from "@/domain/shared/errors";
import { upsertTranslation } from "@/infrastructure/repositories/translations.repository";
import type { AppLocale } from "@/types/cms";
import { z } from "zod";

export async function updateThemeAction(payload: Record<string, string>) {
  try {
    await requirePermission("theme.manage");
    const parsed = themeUpdateSchema.safeParse(payload);
    if (!parsed.success) throw new ValidationError("Invalid theme", parsed.error.flatten());

    const admin = createAdminClient();
    const { error } = await admin.from("theme_settings").update(parsed.data).not("id", "is", null);
    if (error) throw new DatabaseError(error.message, error);

    await writeAuditLog("theme.update", "theme_settings");
    revalidateTag("theme", "max");
    revalidatePath("/");
    revalidatePath("/admin/theme");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateSiteSettingsAction(payload: {
  site_name_en?: string;
  site_name_ar?: string;
  website_url?: string;
  default_locale?: AppLocale;
  social_links?: Record<string, string>;
}) {
  try {
    await requirePermission("settings.manage");
    const admin = createAdminClient();
    const { data: current, error: readError } = await admin
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (readError) throw new DatabaseError(readError.message, readError);
    if (!current) throw new DatabaseError("Site settings missing");

    const { error } = await admin
      .from("site_settings")
      .update({
        site_name_i18n: {
          ...(current.site_name_i18n as Record<string, string>),
          ...(payload.site_name_en ? { en: payload.site_name_en } : {}),
          ...(payload.site_name_ar ? { ar: payload.site_name_ar } : {}),
        },
        website_url: payload.website_url ?? current.website_url,
        default_locale: payload.default_locale ?? current.default_locale,
        social_links: payload.social_links ?? current.social_links,
      })
      .eq("id", current.id);

    if (error) throw new DatabaseError(error.message, error);
    await writeAuditLog("settings.update", "site_settings", current.id);
    revalidateTag("settings", "max");
    revalidatePath("/");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateHomepageSectionAction(input: {
  id: string;
  is_enabled?: boolean;
  sort_order?: number;
  title_ar?: string;
  title_en?: string;
  body_ar?: string;
  body_en?: string;
}) {
  try {
    await requirePermission("homepage.update");
    const supabase = await createClient();

    if (input.is_enabled !== undefined || input.sort_order !== undefined) {
      const { error } = await supabase
        .from("homepage_sections")
        .update({
          ...(input.is_enabled !== undefined ? { is_enabled: input.is_enabled } : {}),
          ...(input.sort_order !== undefined ? { sort_order: input.sort_order } : {}),
        })
        .eq("id", input.id);
      if (error) throw new DatabaseError(error.message, error);
    }

    if (input.title_ar !== undefined || input.body_ar !== undefined) {
      const { error } = await supabase.from("homepage_section_translations").upsert({
        section_id: input.id,
        locale: "ar",
        title: input.title_ar,
        body: input.body_ar,
      });
      if (error) throw new DatabaseError(error.message, error);
    }
    if (input.title_en !== undefined || input.body_en !== undefined) {
      const { error } = await supabase.from("homepage_section_translations").upsert({
        section_id: input.id,
        locale: "en",
        title: input.title_en,
        body: input.body_en,
      });
      if (error) throw new DatabaseError(error.message, error);
    }

    await writeAuditLog("homepage.update", "homepage_sections", input.id);
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function saveTranslationAction(input: {
  namespaceSlug: string;
  key: string;
  locale: AppLocale;
  value: string;
}) {
  try {
    await requirePermission("translations.update");
    const schema = z.object({
      namespaceSlug: z.string().min(1),
      key: z.string().min(1),
      locale: z.enum(["ar", "en"]),
      value: z.string(),
    });
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid translation", parsed.error.flatten());

    await upsertTranslation(parsed.data);
    await writeAuditLog("translations.update", "translations");
    revalidateTag("translations", "max");
    revalidateTag(`translations:${parsed.data.locale}`, "max");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

/** Generic privileged save for modules still using form actions */
export async function saveModuleAction(module: string, payload: unknown) {
  try {
    await requirePermission("settings.manage");
    await writeAuditLog(`${module}.update`, module, undefined, { payload });
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}
