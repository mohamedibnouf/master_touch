import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import {
  getContactContent,
  getHomepageSections,
  getPageSeo,
  getServices,
} from "@/infrastructure/repositories/content.repository";
import {
  CtaBanner,
  ContactMap,
  HeroSlider,
  SectionHeading,
  ServiceCard,
  StatsCounter,
  TextBlock,
  ValuesGrid,
} from "@/presentation/components/marketing/sections";
import { Button } from "@/presentation/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = await getPageSeo("home", locale as Locale);
  return buildPageMetadata({
    locale: locale as Locale,
    path: "",
    seo,
    fallbackTitle: "Master Touch",
    fallbackDescription:
      "Electromechanical works, architectural finishing, and smart solutions in Saudi Arabia.",
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [sections, services, contact] = await Promise.all([
    getHomepageSections(locale),
    getServices(locale),
    getContactContent(locale),
  ]);

  const enabled = sections.filter((s) => s.is_enabled).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      {enabled.map((section) => {
        switch (section.key) {
          case "hero":
            return <HeroSlider key={section.id} section={section} locale={locale} />;
          case "about":
            return (
              <section key={section.id} className="section-pad">
                <div className="container-mt grid items-center gap-10 md:grid-cols-2">
                  <div>
                    <SectionHeading title={section.title} subtitle={section.subtitle} />
                    <p className="text-lg leading-relaxed text-[var(--muted-foreground)]">{section.body}</p>
                    {section.cta_href ? (
                      <Link href={`/${locale}${section.cta_href}`} className="mt-6 inline-block">
                        <Button variant="outline">{section.cta_label}</Button>
                      </Link>
                    ) : null}
                  </div>
                  <div className="glass min-h-72 rounded-3xl bg-[url('/images/placeholders/about-cover.svg')] bg-cover bg-center" />
                </div>
              </section>
            );
          case "stats":
            return <StatsCounter key={section.id} section={section} />;
          case "vision":
          case "mission":
            return <TextBlock key={section.id} section={section} />;
          case "values":
            return <ValuesGrid key={section.id} section={section} />;
          case "services":
            return (
              <section key={section.id} className="section-pad bg-[var(--muted)]">
                <div className="container-mt">
                  <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <SectionHeading title={section.title} subtitle={section.subtitle} />
                    {section.cta_href ? (
                      <Link href={`/${locale}${section.cta_href}`}>
                        <Button variant="accent">{section.cta_label}</Button>
                      </Link>
                    ) : null}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((service) => (
                      <ServiceCard key={service.id} service={service} locale={locale} />
                    ))}
                  </div>
                </div>
              </section>
            );
          case "cta":
            return <CtaBanner key={section.id} section={section} locale={locale} />;
          case "contact_map":
            return (
              <section key={section.id} className="section-pad">
                <div className="container-mt">
                  <SectionHeading title={section.title} subtitle={section.subtitle} />
                  <ContactMap embedUrl={contact.map_embed_url} />
                </div>
              </section>
            );
          default:
            return <TextBlock key={section.id} section={section} />;
        }
      })}
    </>
  );
}
