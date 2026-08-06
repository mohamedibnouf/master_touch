"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { themeUpdateSchema, siteSettingsUpdateSchema, serviceSlugSchema } from "@/lib/validations";
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
    revalidatePath("/ar");
    revalidatePath("/en");
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
    const parsed = siteSettingsUpdateSchema.safeParse(payload);
    if (!parsed.success) throw new ValidationError("Invalid site settings", parsed.error.flatten());

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
          ...(parsed.data.site_name_en ? { en: parsed.data.site_name_en } : {}),
          ...(parsed.data.site_name_ar ? { ar: parsed.data.site_name_ar } : {}),
        },
        website_url: parsed.data.website_url || current.website_url,
        default_locale: parsed.data.default_locale ?? current.default_locale,
        social_links: parsed.data.social_links ?? current.social_links,
      })
      .eq("id", current.id);

    if (error) throw new DatabaseError(error.message, error);
    await writeAuditLog("settings.update", "site_settings", current.id);
    revalidateTag("settings", "max");
    revalidatePath("/");
    revalidatePath("/admin/settings");
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
    const admin = createAdminClient();

    if (input.is_enabled !== undefined || input.sort_order !== undefined) {
      const { error } = await admin
        .from("homepage_sections")
        .update({
          ...(input.is_enabled !== undefined ? { is_enabled: input.is_enabled } : {}),
          ...(input.sort_order !== undefined ? { sort_order: input.sort_order } : {}),
        })
        .eq("id", input.id);
      if (error) throw new DatabaseError(error.message, error);
    }

    if (input.title_ar !== undefined || input.body_ar !== undefined) {
      const { data: existingAr, error: readArError } = await admin
        .from("homepage_section_translations")
        .select("title, body")
        .eq("section_id", input.id)
        .eq("locale", "ar")
        .maybeSingle();
      if (readArError) throw new DatabaseError(readArError.message, readArError);
      const { error } = await admin.from("homepage_section_translations").upsert(
        {
          section_id: input.id,
          locale: "ar",
          title: input.title_ar !== undefined ? input.title_ar : (existingAr?.title ?? null),
          body: input.body_ar !== undefined ? input.body_ar : (existingAr?.body ?? null),
        },
        { onConflict: "section_id,locale" },
      );
      if (error) throw new DatabaseError(error.message, error);
    }
    if (input.title_en !== undefined || input.body_en !== undefined) {
      const { data: existingEn, error: readEnError } = await admin
        .from("homepage_section_translations")
        .select("title, body")
        .eq("section_id", input.id)
        .eq("locale", "en")
        .maybeSingle();
      if (readEnError) throw new DatabaseError(readEnError.message, readEnError);
      const { error } = await admin.from("homepage_section_translations").upsert(
        {
          section_id: input.id,
          locale: "en",
          title: input.title_en !== undefined ? input.title_en : (existingEn?.title ?? null),
          body: input.body_en !== undefined ? input.body_en : (existingEn?.body ?? null),
        },
        { onConflict: "section_id,locale" },
      );
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

export async function updateAboutAction(formData: FormData) {
  try {
    await requirePermission("about.update");
    const aboutId = String(formData.get("about_id") ?? "");
    if (!aboutId) throw new ValidationError("about_id required");

    const admin = createAdminClient();
    const { error: pageError } = await admin
      .from("about_pages")
      .update({
        cover_image_url: String(formData.get("cover_image_url") ?? "") || null,
        video_url: String(formData.get("video_url") ?? "") || null,
        ceo_image_url: String(formData.get("ceo_image_url") ?? "") || null,
      })
      .eq("id", aboutId);
    if (pageError) throw new DatabaseError(pageError.message, pageError);

    for (const locale of ["ar", "en"] as const) {
      const { error } = await admin.from("about_translations").upsert(
        {
          about_id: aboutId,
          locale,
          history: String(formData.get(`history_${locale}`) ?? "") || null,
          vision: String(formData.get(`vision_${locale}`) ?? "") || null,
          mission: String(formData.get(`mission_${locale}`) ?? "") || null,
          objectives: String(formData.get(`objectives_${locale}`) ?? "") || null,
          ceo_message: String(formData.get(`ceo_message_${locale}`) ?? "") || null,
          ceo_name: String(formData.get(`ceo_name_${locale}`) ?? "") || null,
          ceo_title: String(formData.get(`ceo_title_${locale}`) ?? "") || null,
        },
        { onConflict: "about_id,locale" },
      );
      if (error) throw new DatabaseError(error.message, error);
    }

    await writeAuditLog("about.update", "about_pages", aboutId);
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateContactSettingsAction(formData: FormData) {
  try {
    await requirePermission("contact.update");
    const settingsId = String(formData.get("settings_id") ?? "");
    if (!settingsId) throw new ValidationError("settings_id required");
    const idOk = z.string().uuid().safeParse(settingsId);
    if (!idOk.success) throw new ValidationError("Invalid settings_id");

    const notifyRaw = String(formData.get("notify_email") ?? "").trim();
    if (notifyRaw) {
      const emailOk = z.string().email().safeParse(notifyRaw);
      if (!emailOk.success) throw new ValidationError("Invalid notify_email");
    }
    const mapRaw = String(formData.get("map_embed_url") ?? "").trim();
    if (mapRaw) {
      const urlOk = z.string().url().safeParse(mapRaw);
      if (!urlOk.success) throw new ValidationError("Invalid map_embed_url");
    }

    const admin = createAdminClient();
    const { error: settingsError } = await admin
      .from("contact_settings")
      .update({
        notify_email: notifyRaw || null,
        map_embed_url: mapRaw || null,
        is_form_enabled: formData.get("is_form_enabled") === "on" || formData.get("is_form_enabled") === "true",
      })
      .eq("id", settingsId);
    if (settingsError) throw new DatabaseError(settingsError.message, settingsError);

    for (const locale of ["ar", "en"] as const) {
      const { error } = await admin.from("contact_setting_translations").upsert(
        {
          settings_id: settingsId,
          locale,
          headline: String(formData.get(`headline_${locale}`) ?? "") || null,
          intro: String(formData.get(`intro_${locale}`) ?? "") || null,
          form_success_message: String(formData.get(`form_success_${locale}`) ?? "") || null,
        },
        { onConflict: "settings_id,locale" },
      );
      if (error) throw new DatabaseError(error.message, error);
    }

    await writeAuditLog("contact.update", "contact_settings", settingsId);
    revalidatePath("/contact");
    revalidatePath("/ar/contact");
    revalidatePath("/en/contact");
    revalidatePath("/admin/contact");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function listContactMessagesAction() {
  try {
    await requirePermission("contact_messages.view");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("contact_messages")
      .select("id, name, email, phone, subject, message, status, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new DatabaseError(error.message, error);
    return { ok: true as const, data: data ?? [] };
  } catch (error) {
    return { ...toActionError(error), data: [] as const };
  }
}

export async function updateContactMessageStatusAction(id: string, status: string) {
  try {
    await requirePermission("contact_messages.update");
    const idOk = z.string().uuid().safeParse(id);
    if (!idOk.success) throw new ValidationError("Invalid id");
    const parsed = z.enum(["new", "read", "replied", "archived"]).safeParse(status);
    if (!parsed.success) throw new ValidationError("Invalid status");
    const admin = createAdminClient();
    const { error } = await admin
      .from("contact_messages")
      .update({ status: parsed.data })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw new DatabaseError(error.message, error);
    await writeAuditLog("contact_messages.update", "contact_messages", id, { status: parsed.data });
    revalidatePath("/admin/contact");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function createServiceAction(formData: FormData) {
  try {
    await requirePermission("services.create");
    const slugRaw = String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slugParsed = serviceSlugSchema.safeParse(slugRaw);
    if (!slugParsed.success) throw new ValidationError("Invalid slug");

    const titles = {
      ar: String(formData.get("title_ar") ?? "").trim(),
      en: String(formData.get("title_en") ?? "").trim(),
    };
    if (!titles.ar || !titles.en) throw new ValidationError("title_ar and title_en required");

    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("services")
      .select("id")
      .eq("slug", slugParsed.data)
      .is("deleted_at", null)
      .maybeSingle();
    if (existing) throw new ValidationError("Slug already exists");

    const { data, error } = await admin
      .from("services")
      .insert({
        slug: slugParsed.data,
        icon: String(formData.get("icon") ?? "") || null,
        cover_image_url: String(formData.get("cover_image_url") ?? "") || null,
        is_featured: formData.get("is_featured") === "on",
        is_published: formData.get("is_published") === "on",
        sort_order: Number(formData.get("sort_order") ?? 0) || 0,
        status: formData.get("is_published") === "on" ? "published" : "draft",
      })
      .select("id")
      .single();
    if (error) throw new DatabaseError(error.message, error);

    try {
      for (const locale of ["ar", "en"] as const) {
        const { error: trError } = await admin.from("service_translations").upsert(
          {
            service_id: data.id,
            locale,
            title: titles[locale],
            summary: String(formData.get(`summary_${locale}`) ?? "") || null,
            description: String(formData.get(`description_${locale}`) ?? "") || null,
            seo_title: String(formData.get(`seo_title_${locale}`) ?? "") || null,
            seo_description: String(formData.get(`seo_description_${locale}`) ?? "") || null,
          },
          { onConflict: "service_id,locale" },
        );
        if (trError) throw new DatabaseError(trError.message, trError);
      }
    } catch (trFailure) {
      await admin
        .from("services")
        .update({ deleted_at: new Date().toISOString(), is_published: false })
        .eq("id", data.id);
      throw trFailure;
    }

    await writeAuditLog("services.create", "services", data.id);
    revalidatePath("/services");
    revalidatePath("/ar/services");
    revalidatePath("/en/services");
    revalidatePath("/admin/services");
    return { ok: true as const, id: data.id };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateServiceAction(formData: FormData) {
  try {
    await requirePermission("services.update");
    const id = String(formData.get("id") ?? "");
    if (!id) throw new ValidationError("id required");
    const idOk = z.string().uuid().safeParse(id);
    if (!idOk.success) throw new ValidationError("Invalid id");

    const slugRaw = String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slugParsed = serviceSlugSchema.safeParse(slugRaw);
    if (!slugParsed.success) throw new ValidationError("Invalid slug");

    const titles = {
      ar: String(formData.get("title_ar") ?? "").trim(),
      en: String(formData.get("title_en") ?? "").trim(),
    };
    if (!titles.ar || !titles.en) throw new ValidationError("title_ar and title_en required");

    const admin = createAdminClient();
    const { data: conflict } = await admin
      .from("services")
      .select("id")
      .eq("slug", slugParsed.data)
      .neq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (conflict) throw new ValidationError("Slug already exists");

    const published = formData.get("is_published") === "on";
    const { error } = await admin
      .from("services")
      .update({
        slug: slugParsed.data,
        icon: String(formData.get("icon") ?? "") || null,
        cover_image_url: String(formData.get("cover_image_url") ?? "") || null,
        is_featured: formData.get("is_featured") === "on",
        is_published: published,
        sort_order: Number(formData.get("sort_order") ?? 0) || 0,
        status: published ? "published" : "draft",
      })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw new DatabaseError(error.message, error);

    for (const locale of ["ar", "en"] as const) {
      const { error: trError } = await admin.from("service_translations").upsert(
        {
          service_id: id,
          locale,
          title: titles[locale],
          summary: String(formData.get(`summary_${locale}`) ?? "") || null,
          description: String(formData.get(`description_${locale}`) ?? "") || null,
          seo_title: String(formData.get(`seo_title_${locale}`) ?? "") || null,
          seo_description: String(formData.get(`seo_description_${locale}`) ?? "") || null,
        },
        { onConflict: "service_id,locale" },
      );
      if (trError) throw new DatabaseError(trError.message, trError);
    }

    await writeAuditLog("services.update", "services", id);
    revalidatePath("/services");
    revalidatePath("/ar/services");
    revalidatePath("/en/services");
    revalidatePath("/admin/services");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteServiceAction(id: string) {
  try {
    await requirePermission("services.delete");
    const idOk = z.string().uuid().safeParse(id);
    if (!idOk.success) throw new ValidationError("Invalid id");
    const admin = createAdminClient();
    const { error } = await admin
      .from("services")
      .update({ deleted_at: new Date().toISOString(), is_published: false })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw new DatabaseError(error.message, error);
    await writeAuditLog("services.delete", "services", id);
    revalidatePath("/services");
    revalidatePath("/ar/services");
    revalidatePath("/en/services");
    revalidatePath("/admin/services");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function upsertPageSeoAction(formData: FormData) {
  try {
    await requirePermission("settings.manage");
    const pageSlug = String(formData.get("page_slug") ?? "");
    const locale = String(formData.get("locale") ?? "en") as AppLocale;
    if (!pageSlug) throw new ValidationError("page_slug required");
    if (locale !== "ar" && locale !== "en") throw new ValidationError("invalid locale");

    const admin = createAdminClient();
    const { data: page, error: pageError } = await admin
      .from("pages")
      .select("id")
      .eq("slug", pageSlug)
      .maybeSingle();
    if (pageError) throw new DatabaseError(pageError.message, pageError);
    if (!page) throw new DatabaseError(`Page not found: ${pageSlug}`);

    let schemaJson: unknown = null;
    const rawSchema = String(formData.get("schema_json") ?? "").trim();
    if (rawSchema) {
      try {
        schemaJson = JSON.parse(rawSchema);
      } catch {
        throw new ValidationError("schema_json must be valid JSON");
      }
    }

    const { error } = await admin.from("page_seo").upsert(
      {
        page_id: page.id,
        locale,
        meta_title: String(formData.get("meta_title") ?? "") || null,
        meta_description: String(formData.get("meta_description") ?? "") || null,
        meta_keywords: String(formData.get("meta_keywords") ?? "") || null,
        og_title: String(formData.get("og_title") ?? "") || null,
        og_description: String(formData.get("og_description") ?? "") || null,
        og_image_url: String(formData.get("og_image_url") ?? "") || null,
        twitter_title: String(formData.get("twitter_title") ?? "") || null,
        twitter_description: String(formData.get("twitter_description") ?? "") || null,
        twitter_image_url: String(formData.get("twitter_image_url") ?? "") || null,
        canonical_url: String(formData.get("canonical_url") ?? "") || null,
        robots: String(formData.get("robots") ?? "") || "index,follow",
        schema_json: schemaJson,
      },
      { onConflict: "page_id,locale" },
    );
    if (error) throw new DatabaseError(error.message, error);

    await writeAuditLog("seo.update", "page_seo", page.id, { pageSlug, locale });
    revalidatePath("/");
    revalidatePath("/admin/seo");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function listAuditLogsAction() {
  try {
    await requirePermission("audit_logs.view");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("audit_logs")
      .select("id, actor_id, action, entity_type, entity_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new DatabaseError(error.message, error);
    return { ok: true as const, data: data ?? [] };
  } catch (error) {
    return { ...toActionError(error), data: [] as const };
  }
}
