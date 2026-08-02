import { serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo/schema";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";
import { getServiceBySlug, getServices } from "@/infrastructure/repositories/content.repository";
import { Button } from "@/presentation/components/ui/button";
import { PageHero, ServiceCard } from "@/presentation/components/marketing/sections";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug, locale as Locale);
  return buildPageMetadata({
    locale: locale as Locale,
    path: `/services/${slug}`,
    seo: service
      ? {
          meta_title: service.seo_title,
          meta_description: service.seo_description,
          meta_keywords: null,
          og_title: service.seo_title,
          og_description: service.seo_description,
          og_image_url: service.cover_image_url,
          canonical_url: null,
          robots: "index,follow",
        }
      : null,
    fallbackTitle: service?.title ?? slug,
    fallbackDescription: service?.summary ?? "",
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const service = await getServiceBySlug(slug, locale);
  if (!service) notFound();

  const t = await getTranslations("common");
  const related = (await getServices(locale)).filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd({
              name: service.title,
              description: service.summary ?? service.description ?? "",
              slug: service.slug,
              locale,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(
              [
                { name: "Home", path: "" },
                { name: "Services", path: "/services" },
                { name: service.title, path: `/services/${service.slug}` },
              ],
              locale,
            ),
          ),
        }}
      />
      <PageHero
        title={service.title}
        subtitle={service.summary}
        imageSrc={service.cover_image_url || "/images/placeholders/hero-1.svg"}
      />
      <section className="section-pad">
        <div className="container-mt max-w-3xl">
          <p className="text-lg leading-relaxed text-[var(--muted-foreground)] md:text-xl">
            {service.description}
          </p>
          <Link href={`/${locale}/contact`} className="mt-10 inline-block">
            <Button variant="accent" size="lg">
              {t("requestQuote")}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </section>
      {related.length ? (
        <section className="section-pad bg-[var(--muted)]">
          <div className="container-mt">
            <h2 className="mb-8 font-display text-h2 font-semibold tracking-tight text-[var(--primary)] md:mb-10">
              {t("relatedServices")}
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((s, i) => (
                <ServiceCard key={s.id} service={s} locale={locale} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
