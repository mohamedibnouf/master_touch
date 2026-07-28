import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDirection } from "@/lib/utils";
import { SiteFooter, SiteHeader } from "@/presentation/components/layout/SiteChrome";
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

  const messages = await getMessages();
  const [site, theme] = await Promise.all([getCachedSiteSettings(), getCachedThemeSettings()]);
  const brand = site.site_name_i18n[locale] ?? site.site_name_i18n.en;
  const tagline = site.tagline_i18n[locale] ?? site.tagline_i18n.en ?? "";
  const dir = getDirection(locale);

  const cssVars = {
    ["--primary" as string]: theme.primary_color,
    ["--secondary" as string]: theme.secondary_color,
    ["--accent" as string]: theme.accent_color,
    ["--background" as string]: theme.background_color,
    ["--foreground" as string]: theme.foreground_color,
    ["--radius" as string]: theme.border_radius,
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
      </NextIntlClientProvider>
    </div>
  );
}
