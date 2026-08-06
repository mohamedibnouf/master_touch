import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDirection } from "@/lib/utils";
import { SiteFooter, SiteHeader } from "@/presentation/components/layout/SiteChrome";
import { WhatsAppFloat } from "@/presentation/components/shared/WhatsAppFloat";
import {
  getCachedSiteSettings,
  getCachedThemeSettings,
} from "@/infrastructure/repositories/content.repository";
import { organizationJsonLd } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!locales.includes(raw as Locale)) notFound();
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [messages, tCommon, site, theme] = await Promise.all([
    getMessages(),
    getTranslations("common"),
    getCachedSiteSettings(),
    getCachedThemeSettings(),
  ]);
  const brand = site.site_name_i18n[locale] ?? site.site_name_i18n.en;
  const tagline = site.tagline_i18n[locale] ?? site.tagline_i18n.en ?? "";
  const dir = getDirection(locale);

  // Soften legacy sharp corners from CMS theme to the current soft radius.
  const accentRaw = (theme.accent_color ?? "").trim().toLowerCase();
  const accent =
    accentRaw === "#e87722" || accentRaw === "#e36a1a" ? "#1e5eff" : theme.accent_color;
  const radiusRaw = (theme.border_radius ?? "").trim();
  const radius =
    !radiusRaw || radiusRaw === "0" || radiusRaw === "0.125rem" || radiusRaw === "0.5rem"
      ? "0.75rem"
      : radiusRaw;
  const background =
    (theme.background_color ?? "").trim().toLowerCase() === "#ffffff"
      ? "#f4f6f9"
      : theme.background_color;

  const cssVars = {
    ["--primary" as string]: theme.primary_color,
    ["--secondary" as string]: theme.secondary_color,
    ["--accent" as string]: accent,
    ["--ring" as string]: accent,
    ["--background" as string]: background,
    ["--foreground" as string]: theme.foreground_color,
    ["--radius" as string]: radius,
  };

  return (
    <div lang={locale} dir={dir} style={cssVars}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      <NextIntlClientProvider messages={messages}>
        <SiteHeader brand={brand} />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <SiteFooter brand={brand} tagline={tagline} year={new Date().getFullYear()} />
        <WhatsAppFloat label={tCommon("whatsappChat")} />
      </NextIntlClientProvider>
    </div>
  );
}
