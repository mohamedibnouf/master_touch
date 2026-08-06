import type {
  AboutContent,
  AppLocale,
  ContactContent,
  HomepageSection,
  PageSeo,
  ServiceItem,
  SiteSettings,
  ThemeSettings,
} from "@/types/cms";
import { createPublicClient } from "@/infrastructure/supabase/public";
import { isSupabaseConfigured } from "@/infrastructure/supabase/config";
import { DatabaseError, NotFoundError } from "@/domain/shared/errors";
import { unstable_cache } from "next/cache";
import { logger } from "@/infrastructure/logging/logger";
import {
  previewAboutContent,
  previewContactContent,
  previewHomepageSections,
  previewPageSeo,
  previewServices,
  previewSiteSettings,
  previewThemeSettings,
} from "@/infrastructure/repositories/preview-content";

function sb() {
  return createPublicClient();
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  if (!isSupabaseConfigured()) return previewThemeSettings;
  try {
    const supabase = sb();
    const { data, error } = await supabase.from("theme_settings").select("*").limit(1).maybeSingle();
    if (error) throw new DatabaseError(error.message, error);
    if (!data) throw new NotFoundError("Theme settings not found. Run database seeds.");
    return data as ThemeSettings;
  } catch {
    return previewThemeSettings;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return previewSiteSettings;
  try {
    const supabase = sb();
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (error) throw new DatabaseError(error.message, error);
    if (!data) throw new NotFoundError("Site settings not found. Run database seeds.");
    return data as SiteSettings;
  } catch {
    return previewSiteSettings;
  }
}

export const getCachedThemeSettings = () =>
  unstable_cache(getThemeSettings, ["theme-settings"], {
    tags: ["theme"],
    revalidate: 60,
  })();

export const getCachedSiteSettings = () =>
  unstable_cache(getSiteSettings, ["site-settings"], {
    tags: ["settings"],
    revalidate: 60,
  })();

export async function getHomepageSections(locale: AppLocale): Promise<HomepageSection[]> {
  if (!isSupabaseConfigured()) return previewHomepageSections(locale);
  try {
  const supabase = sb();
  const { data: sections, error } = await supabase
    .from("homepage_sections")
    .select("*, homepage_section_translations(*), homepage_slides(*, homepage_slide_translations(*))")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) throw new DatabaseError(error.message, error);
  if (!sections?.length) return [];

  return sections.map((section) => {
    const tr =
      section.homepage_section_translations?.find((t: { locale: string }) => t.locale === locale) ??
      section.homepage_section_translations?.[0];

    const slides = (section.homepage_slides ?? [])
      .filter((s: { deleted_at: string | null; is_enabled: boolean }) => !s.deleted_at && s.is_enabled)
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map(
        (slide: {
          id: string;
          media_url: string | null;
          sort_order: number;
          is_enabled: boolean;
          link_url: string | null;
          homepage_slide_translations: Array<{
            locale: string;
            title: string | null;
            subtitle: string | null;
            cta_label: string | null;
          }>;
        }) => {
          const st =
            slide.homepage_slide_translations?.find((t) => t.locale === locale) ??
            slide.homepage_slide_translations?.[0];
          return {
            id: slide.id,
            media_url: slide.media_url,
            sort_order: slide.sort_order,
            is_enabled: slide.is_enabled,
            link_url: slide.link_url,
            title: st?.title ?? null,
            subtitle: st?.subtitle ?? null,
            cta_label: st?.cta_label ?? null,
          };
        },
      );

    return {
      id: section.id,
      key: section.key,
      sort_order: section.sort_order,
      is_enabled: section.is_enabled,
      settings: section.settings,
      title: tr?.title ?? null,
      subtitle: tr?.subtitle ?? null,
      body: tr?.body ?? null,
      cta_label: tr?.cta_label ?? null,
      cta_href: tr?.cta_href ?? null,
      slides,
    } satisfies HomepageSection;
  });
  } catch {
    return previewHomepageSections(locale);
  }
}

export async function getAboutContent(locale: AppLocale): Promise<AboutContent> {
  if (!isSupabaseConfigured()) return previewAboutContent(locale);
  try {
  const supabase = sb();
  const { data, error } = await supabase
    .from("about_pages")
    .select(
      `*, about_translations(*), about_values(*, about_value_translations(*)),
       about_stats(*, about_stat_translations(*)),
       about_timeline_items(*, about_timeline_translations(*))`,
    )
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (error) throw new DatabaseError(error.message, error);
  if (!data) throw new NotFoundError("About content not found. Run database seeds.");

  const tr =
    data.about_translations?.find((t: { locale: string }) => t.locale === locale) ??
    data.about_translations?.[0];

  return {
    id: data.id,
    cover_image_url: data.cover_image_url,
    video_url: data.video_url,
    ceo_image_url: data.ceo_image_url,
    history: tr?.history ?? null,
    vision: tr?.vision ?? null,
    mission: tr?.mission ?? null,
    objectives: tr?.objectives ?? null,
    ceo_message: tr?.ceo_message ?? null,
    ceo_name: tr?.ceo_name ?? null,
    ceo_title: tr?.ceo_title ?? null,
    values: (data.about_values ?? [])
      .filter((v: { deleted_at: string | null; is_enabled: boolean }) => !v.deleted_at && v.is_enabled)
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map(
        (v: {
          id: string;
          icon: string | null;
          sort_order: number;
          about_value_translations: Array<{
            locale: string;
            title: string;
            description: string | null;
          }>;
        }) => {
          const vt =
            v.about_value_translations?.find((t) => t.locale === locale) ??
            v.about_value_translations?.[0];
          return {
            id: v.id,
            icon: v.icon,
            sort_order: v.sort_order,
            title: vt?.title ?? "",
            description: vt?.description ?? null,
          };
        },
      ),
    stats: (data.about_stats ?? [])
      .filter((s: { deleted_at: string | null; is_enabled: boolean }) => !s.deleted_at && s.is_enabled)
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map(
        (s: {
          id: string;
          icon: string | null;
          value: string;
          sort_order: number;
          about_stat_translations: Array<{ locale: string; label: string }>;
        }) => {
          const st =
            s.about_stat_translations?.find((t) => t.locale === locale) ??
            s.about_stat_translations?.[0];
          return {
            id: s.id,
            icon: s.icon,
            value: s.value,
            sort_order: s.sort_order,
            label: st?.label ?? "",
          };
        },
      ),
    timeline: (data.about_timeline_items ?? [])
      .filter((t: { deleted_at: string | null; is_enabled: boolean }) => !t.deleted_at && t.is_enabled)
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map(
        (t: {
          id: string;
          event_year: string | null;
          sort_order: number;
          about_timeline_translations: Array<{
            locale: string;
            title: string;
            description: string | null;
          }>;
        }) => {
          const tt =
            t.about_timeline_translations?.find((x) => x.locale === locale) ??
            t.about_timeline_translations?.[0];
          return {
            id: t.id,
            event_year: t.event_year,
            sort_order: t.sort_order,
            title: tt?.title ?? "",
            description: tt?.description ?? null,
          };
        },
      ),
  };
  } catch {
    return previewAboutContent(locale);
  }
}

function mapServiceRow(s: Record<string, unknown>, locale: AppLocale): ServiceItem {
  const translations = (s.service_translations as Array<Record<string, unknown>>) ?? [];
  const tr =
    translations.find((t) => t.locale === locale) ?? translations[0];
  return {
    id: String(s.id),
    slug: String(s.slug),
    icon: (s.icon as string | null) ?? null,
    cover_image_url: (s.cover_image_url as string | null) ?? null,
    is_featured: Boolean(s.is_featured),
    is_published: Boolean(s.is_published),
    sort_order: Number(s.sort_order ?? 0),
    title: (tr?.title as string | undefined) ?? String(s.slug),
    summary: (tr?.summary as string | null | undefined) ?? null,
    description: (tr?.description as string | null | undefined) ?? null,
    seo_title: (tr?.seo_title as string | null | undefined) ?? null,
    seo_description: (tr?.seo_description as string | null | undefined) ?? null,
  };
}

export async function getServices(locale: AppLocale): Promise<ServiceItem[]> {
  if (!isSupabaseConfigured()) return previewServices(locale);
  try {
    const supabase = sb();
    const { data, error } = await supabase
      .from("services")
      .select("*, service_translations(*)")
      .is("deleted_at", null)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) throw new DatabaseError(error.message, error);
    return (data ?? []).map((s) => mapServiceRow(s as Record<string, unknown>, locale));
  } catch {
    return previewServices(locale);
  }
}

/** Admin list: includes drafts/unpublished (service role). */
export async function getAdminServices(locale: AppLocale): Promise<ServiceItem[]> {
  if (!isSupabaseConfigured()) return previewServices(locale);
  try {
    const { createAdminClient } = await import("@/infrastructure/supabase/admin");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("services")
      .select("*, service_translations(*)")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) throw new DatabaseError(error.message, error);
    return (data ?? []).map((s) => mapServiceRow(s as Record<string, unknown>, locale));
  } catch {
    return previewServices(locale);
  }
}

export async function getServiceBySlug(
  slug: string,
  locale: AppLocale,
): Promise<ServiceItem | null> {
  if (!isSupabaseConfigured()) {
    return previewServices(locale).find((s) => s.slug === slug) ?? null;
  }
  try {
    const supabase = sb();
    const { data, error } = await supabase
      .from("services")
      .select("*, service_translations(*)")
      .eq("slug", slug)
      .is("deleted_at", null)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new DatabaseError(error.message, error);
    if (!data) return null;
    return mapServiceRow(data as Record<string, unknown>, locale);
  } catch (error) {
    logger.warn("getServiceBySlug.fallback", {
      slug,
      message: error instanceof Error ? error.message : String(error),
    });
    return previewServices(locale).find((s) => s.slug === slug) ?? null;
  }
}

export type AdminServiceFormRow = ServiceItem & {
  translations: {
    ar: {
      title: string;
      summary: string | null;
      description: string | null;
      seo_title: string | null;
      seo_description: string | null;
    } | null;
    en: {
      title: string;
      summary: string | null;
      description: string | null;
      seo_title: string | null;
      seo_description: string | null;
    } | null;
  };
};

/** Single query for admin services forms (both locales). */
export async function getAdminServicesDetailed(): Promise<AdminServiceFormRow[]> {
  if (!isSupabaseConfigured()) {
    return previewServices("en").map((s) => ({
      ...s,
      translations: {
        en: {
          title: s.title,
          summary: s.summary,
          description: s.description,
          seo_title: s.seo_title,
          seo_description: s.seo_description,
        },
        ar: null,
      },
    }));
  }
  try {
    const { createAdminClient } = await import("@/infrastructure/supabase/admin");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("services")
      .select("*, service_translations(*)")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) throw new DatabaseError(error.message, error);

    return (data ?? []).map((row) => {
      const translations = (row.service_translations as Array<Record<string, unknown>>) ?? [];
      const pick = (locale: AppLocale) => {
        const tr = translations.find((t) => t.locale === locale);
        if (!tr) return null;
        return {
          title: String(tr.title ?? ""),
          summary: (tr.summary as string | null) ?? null,
          description: (tr.description as string | null) ?? null,
          seo_title: (tr.seo_title as string | null) ?? null,
          seo_description: (tr.seo_description as string | null) ?? null,
        };
      };
      return {
        ...mapServiceRow(row as Record<string, unknown>, "en"),
        translations: { ar: pick("ar"), en: pick("en") },
      };
    });
  } catch (error) {
    logger.warn("getAdminServicesDetailed.fallback", {
      message: error instanceof Error ? error.message : String(error),
    });
    return previewServices("en").map((s) => ({
      ...s,
      translations: {
        en: {
          title: s.title,
          summary: s.summary,
          description: s.description,
          seo_title: s.seo_title,
          seo_description: s.seo_description,
        },
        ar: null,
      },
    }));
  }
}

export async function getHomepageSectionsPair(): Promise<{
  ar: HomepageSection[];
  en: HomepageSection[];
}> {
  if (!isSupabaseConfigured()) {
    return { ar: previewHomepageSections("ar"), en: previewHomepageSections("en") };
  }
  try {
    const supabase = sb();
    const { data: sections, error } = await supabase
      .from("homepage_sections")
      .select("*, homepage_section_translations(*), homepage_slides(*, homepage_slide_translations(*))")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) throw new DatabaseError(error.message, error);
    if (!sections?.length) return { ar: [], en: [] };
    return {
      ar: sections.map((section) => mapHomepageSection(section, "ar")),
      en: sections.map((section) => mapHomepageSection(section, "en")),
    };
  } catch (error) {
    logger.warn("getHomepageSectionsPair.fallback", {
      message: error instanceof Error ? error.message : String(error),
    });
    return { ar: previewHomepageSections("ar"), en: previewHomepageSections("en") };
  }
}

function mapHomepageSection(section: Record<string, unknown>, locale: AppLocale): HomepageSection {
  const translations =
    (section.homepage_section_translations as Array<{ locale: string; title?: string | null; subtitle?: string | null; body?: string | null; cta_label?: string | null; cta_href?: string | null }>) ??
    [];
  const tr = translations.find((t) => t.locale === locale) ?? translations[0];

  const slides = ((section.homepage_slides as Array<Record<string, unknown>>) ?? [])
    .filter((s) => !s.deleted_at && s.is_enabled)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((slide) => {
      const slideTrs =
        (slide.homepage_slide_translations as Array<{
          locale: string;
          title: string | null;
          subtitle: string | null;
          cta_label: string | null;
        }>) ?? [];
      const st = slideTrs.find((t) => t.locale === locale) ?? slideTrs[0];
      return {
        id: String(slide.id),
        media_url: (slide.media_url as string | null) ?? null,
        sort_order: Number(slide.sort_order ?? 0),
        is_enabled: Boolean(slide.is_enabled),
        link_url: (slide.link_url as string | null) ?? null,
        title: st?.title ?? null,
        subtitle: st?.subtitle ?? null,
        cta_label: st?.cta_label ?? null,
      };
    });

  return {
    id: String(section.id),
    key: String(section.key),
    sort_order: Number(section.sort_order ?? 0),
    is_enabled: Boolean(section.is_enabled),
    settings: (section.settings as HomepageSection["settings"]) ?? {},
    title: tr?.title ?? null,
    subtitle: tr?.subtitle ?? null,
    body: tr?.body ?? null,
    cta_label: tr?.cta_label ?? null,
    cta_href: tr?.cta_href ?? null,
    slides,
  };
}

export async function getContactContent(locale: AppLocale): Promise<ContactContent> {
  if (!isSupabaseConfigured()) return previewContactContent(locale);
  try {
  const supabase = sb();
  const { data, error } = await supabase
    .from("contact_settings")
    .select(
      `*, contact_setting_translations(*),
       contact_branches(*, contact_branch_translations(*)),
       contact_channels(*)`,
    )
    .limit(1)
    .maybeSingle();

  if (error) throw new DatabaseError(error.message, error);
  if (!data) throw new NotFoundError("Contact settings not found. Run database seeds.");

  const tr =
    data.contact_setting_translations?.find((t: { locale: string }) => t.locale === locale) ??
    data.contact_setting_translations?.[0];

  return {
    id: data.id,
    map_embed_url: data.map_embed_url,
    working_hours_json: data.working_hours_json,
    is_form_enabled: data.is_form_enabled,
    notify_email: data.notify_email,
    headline: tr?.headline ?? null,
    intro: tr?.intro ?? null,
    form_success_message: tr?.form_success_message ?? null,
    branches: (data.contact_branches ?? [])
      .filter((b: { deleted_at: string | null; is_enabled: boolean }) => !b.deleted_at && b.is_enabled)
      .map(
        (b: {
          id: string;
          latitude: number | null;
          longitude: number | null;
          is_primary: boolean;
          contact_branch_translations: Array<{
            locale: string;
            name: string;
            address: string | null;
            city: string | null;
            country: string | null;
          }>;
        }) => {
          const bt =
            b.contact_branch_translations?.find((t) => t.locale === locale) ??
            b.contact_branch_translations?.[0];
          return {
            id: b.id,
            name: bt?.name ?? "",
            address: bt?.address ?? null,
            city: bt?.city ?? null,
            country: bt?.country ?? null,
            latitude: b.latitude,
            longitude: b.longitude,
            is_primary: b.is_primary,
          };
        },
      ),
    channels: (data.contact_channels ?? [])
      .filter((c: { deleted_at: string | null; is_enabled: boolean }) => !c.deleted_at && c.is_enabled)
      .map(
        (c: {
          id: string;
          channel_type: ContactContent["channels"][number]["channel_type"];
          value: string;
          label: string | null;
          is_primary: boolean;
        }) => ({
          id: c.id,
          channel_type: c.channel_type,
          value: c.value,
          label: c.label,
          is_primary: c.is_primary,
        }),
      ),
  };
  } catch {
    return previewContactContent(locale);
  }
}

export async function getPageSeo(slug: string, locale: AppLocale): Promise<PageSeo | null> {
  if (!isSupabaseConfigured()) return previewPageSeo(slug, locale);
  try {
  const supabase = sb();
  const { data: page, error } = await supabase
    .from("pages")
    .select("id, page_seo(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new DatabaseError(error.message, error);
  if (!page) return null;

  const seo =
    page.page_seo?.find((s: { locale: string }) => s.locale === locale) ?? page.page_seo?.[0];
  if (!seo) return null;

  return {
    meta_title: seo.meta_title,
    meta_description: seo.meta_description,
    meta_keywords: seo.meta_keywords,
    og_title: seo.og_title,
    og_description: seo.og_description,
    og_image_url: seo.og_image_url,
    twitter_title: seo.twitter_title ?? null,
    twitter_description: seo.twitter_description ?? null,
    twitter_image_url: seo.twitter_image_url ?? null,
    canonical_url: seo.canonical_url,
    robots: seo.robots,
  };
  } catch {
    return previewPageSeo(slug, locale);
  }
}
