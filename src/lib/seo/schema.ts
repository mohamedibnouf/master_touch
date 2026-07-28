import type { AppLocale } from "@/types/cms";

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mastertouchksa.com";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Master Touch",
    alternateName: "ماستر تاتش",
    url: "https://www.mastertouchksa.com",
    email: "info@mastertouchksa.com",
    telephone: "+966-50-683-4610",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Riyadh",
      addressCountry: "SA",
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  locale: AppLocale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl()}/${locale}${item.path}`,
    })),
  };
}

export function serviceJsonLd(input: {
  name: string;
  description: string;
  slug: string;
  locale: AppLocale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    provider: organizationJsonLd(),
    url: `${baseUrl()}/${input.locale}/services/${input.slug}`,
    areaServed: "SA",
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  locale: AppLocale;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished ?? new Date().toISOString(),
    author: organizationJsonLd(),
    mainEntityOfPage: `${baseUrl()}/${input.locale}${input.path}`,
  };
}

/** Placeholder for Phase 2 projects module */
export function projectJsonLd(input: {
  name: string;
  description: string;
  locale: AppLocale;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.name,
    description: input.description,
    url: `${baseUrl()}/${input.locale}/projects/${input.slug}`,
  };
}
