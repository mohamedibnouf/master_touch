import { setRequestLocale } from "next-intl/server";
import {
  getAboutContent,
  getContactContent,
  getHomepageSections,
  getPageSeo,
  getServices,
} from "@/infrastructure/repositories/content.repository";
import {
  AboutIntro,
  CtaBanner,
  HeroSlider,
  SectionHeading,
  ServicesShowcase,
  StatsCounter,
  TextBlock,
  ValuesGrid,
  VisionMissionPair,
} from "@/presentation/components/marketing/sections";
import { ContactMap } from "@/presentation/components/marketing/ContactMap";
import type { Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { HomepageSection } from "@/types/cms";

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

  const [sections, services, contact, about] = await Promise.all([
    getHomepageSections(locale),
    getServices(locale),
    getContactContent(locale),
    getAboutContent(locale),
  ]);

  const enabled = sections.filter((s) => s.is_enabled).sort((a, b) => a.sort_order - b.sort_order);
  const vision = enabled.find((s) => s.key === "vision");
  const mission = enabled.find((s) => s.key === "mission");
  const pairedIds = new Set([vision?.id, mission?.id].filter(Boolean));

  const renderSection = (section: HomepageSection) => {
    switch (section.key) {
      case "hero":
        return <HeroSlider key={section.id} section={section} locale={locale} />;
      case "about":
        return (
          <AboutIntro
            key={section.id}
            section={section}
            locale={locale}
            coverUrl={about.cover_image_url}
          />
        );
      case "stats":
        return (
          <StatsCounter
            key={section.id}
            section={section}
            items={about.stats.map((s) => ({
              id: s.id,
              value: s.value,
              label: s.label,
            }))}
          />
        );
      case "vision":
      case "mission":
        if (vision && mission && pairedIds.has(section.id)) {
          if (section.id === vision.id) {
            return <VisionMissionPair key="vision-mission" vision={vision} mission={mission} />;
          }
          return null;
        }
        return <TextBlock key={section.id} section={section} />;
      case "values":
        return <ValuesGrid key={section.id} section={section} items={about.values} />;
      case "services":
        return (
          <ServicesShowcase
            key={section.id}
            section={section}
            services={services}
            locale={locale}
          />
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
  };

  return <>{enabled.map((section) => renderSection(section))}</>;
}
