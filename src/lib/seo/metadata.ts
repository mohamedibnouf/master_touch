import type { Metadata } from "next";
import type { AppLocale, PageSeo } from "@/types/cms";

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mastertouchksa.com";

export function buildPageMetadata({
  locale,
  path,
  seo,
  fallbackTitle,
  fallbackDescription,
}: {
  locale: AppLocale;
  path: string;
  seo?: PageSeo | null;
  fallbackTitle: string;
  fallbackDescription: string;
}): Metadata {
  const title = seo?.meta_title ?? fallbackTitle;
  const description = seo?.meta_description ?? fallbackDescription;
  const canonical = seo?.canonical_url ?? `${baseUrl()}/${locale}${path}`;
  const ogImage = seo?.og_image_url ?? undefined;
  const alternateLocale = locale === "ar" ? "en" : "ar";

  return {
    title,
    description,
    keywords: seo?.meta_keywords ?? undefined,
    robots: seo?.robots ?? "index,follow",
    alternates: {
      canonical,
      languages: {
        ar: `${baseUrl()}/ar${path}`,
        en: `${baseUrl()}/en${path}`,
        "x-default": `${baseUrl()}/ar${path}`,
      },
    },
    openGraph: {
      title: seo?.og_title ?? title,
      description: seo?.og_description ?? description,
      url: canonical,
      siteName: "Master Touch",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: [alternateLocale === "ar" ? "ar_SA" : "en_US"],
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.og_title ?? title,
      description: seo?.og_description ?? description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export { organizationJsonLd } from "./schema";
