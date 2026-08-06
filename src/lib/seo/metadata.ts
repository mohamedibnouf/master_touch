import type { Metadata } from "next";
import type { AppLocale, PageSeo } from "@/types/cms";

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mastertouchksa.com";

const DEFAULT_OG_IMAGE = () => `${baseUrl()}/images/logo-master-touch.png`;

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
  const alternateLocale = locale === "ar" ? "en" : "ar";
  const ogImage = seo?.og_image_url || DEFAULT_OG_IMAGE();
  const twitterImage = seo?.twitter_image_url || ogImage;
  const ogTitle = seo?.og_title ?? title;
  const ogDescription = seo?.og_description ?? description;

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
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: "Master Touch",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: [alternateLocale === "ar" ? "ar_SA" : "en_US"],
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Master Touch",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitter_title ?? ogTitle,
      description: seo?.twitter_description ?? ogDescription,
      images: [twitterImage],
    },
  };
}

export { organizationJsonLd } from "./schema";
