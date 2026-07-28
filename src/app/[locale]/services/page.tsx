import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";
import { getPageSeo, getServices } from "@/infrastructure/repositories/content.repository";
import { SectionHeading, ServiceCard } from "@/presentation/components/marketing/sections";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  const seo = await getPageSeo("services", locale as Locale);
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/services",
    seo,
    fallbackTitle: t("servicesTitle"),
    fallbackDescription: t("servicesIntro"),
  });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const services = await getServices(locale);
  const t = await getTranslations("pages");

  return (
    <div className="pt-20">
      <section className="hero-gradient section-pad text-white">
        <div className="container-mt">
          <h1 className="font-display text-5xl md:text-6xl">{t("servicesTitle")}</h1>
          <p className="mt-4 max-w-2xl text-white/80">{t("servicesIntro")}</p>
        </div>
      </section>
      <section className="section-pad">
        <div className="container-mt">
          <SectionHeading title={t("servicesWhatWeDeliver")} subtitle={t("servicesSubtitle")} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
