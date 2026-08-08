import type { AppLocale } from "@/types/cms";

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mastertouchksa.com";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Master Touch",
    alternateName: "ماستر تاتش",
    url: "https://www.mastertouch-ksa.com",
    logo: `${baseUrl()}/images/logo-master-touch.png`,
    email: "info@mastertouch-ksa.com",
    telephone: "+966 506834610",
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
