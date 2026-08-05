import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";
import { getPageSeo, getServices } from "@/infrastructure/repositories/content.repository";
import { PageHero, ServiceCard } from "@/presentation/components/marketing/sections";
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
    <div>
      <PageHero
        title={t("servicesTitle")}
        subtitle={t("servicesIntro")}
        imageSrc="/images/placeholders/hero-2.svg"
      />
      <section className="services-engineering section-pad">
        <div className="container-mt">
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">Systems</p>
              <h2 className="font-display text-h2 font-semibold tracking-tight text-[var(--primary)]">
                {t("servicesWhatWeDeliver")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
                {t("servicesSubtitle")}
              </p>
            </div>
            <span className="text-[0.65rem] font-semibold tracking-[0.22em] uppercase text-[var(--muted-foreground)]">
              {String(services.length).padStart(2, "0")} disciplines
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service, i) => (
              <ServiceCard
                key={service.id}
                service={service}
                locale={locale}
                featured={i === 0}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
