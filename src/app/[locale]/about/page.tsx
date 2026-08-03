import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";
import { getAboutContent, getPageSeo } from "@/infrastructure/repositories/content.repository";
import {
  PageHero,
  SectionHeading,
  Timeline,
  ValuesShowcase,
} from "@/presentation/components/marketing/sections";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages" });
  const seo = await getPageSeo("about", locale as Locale);
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/about",
    seo,
    fallbackTitle: t("aboutTitle"),
    fallbackDescription: t("aboutStory"),
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const about = await getAboutContent(locale);
  const t = await getTranslations("pages");
  const excerpt = about.history
    ? about.history.length > 160
      ? `${about.history.slice(0, 160)}…`
      : about.history
    : null;

  return (
    <div>
      <PageHero
        title={t("aboutTitle")}
        subtitle={excerpt}
        imageSrc={
          !about.cover_image_url || about.cover_image_url.includes("placeholders/about-cover")
            ? "/images/about-company.png"
            : about.cover_image_url
        }
      />

      <section className="section-pad">
        <div className="container-mt grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading title={t("aboutStory")} />
            <p className="text-lg leading-relaxed text-[var(--muted-foreground)]">{about.history}</p>
            {about.objectives ? (
              <p className="mt-8 border-s-2 border-[var(--accent)] ps-5 text-base leading-relaxed text-[var(--foreground)]">
                {about.objectives}
              </p>
            ) : null}
          </div>
          <div className="image-frame relative min-h-[20rem] overflow-hidden rounded-2xl lg:col-span-5 lg:min-h-[28rem]">
            {/* eslint-disable-next-line @next/next/no-img-element -- local SVG placeholders */}
            <img
              src={
                !about.cover_image_url || about.cover_image_url.includes("placeholders/about-cover")
                  ? "/images/about-company.png"
                  : about.cover_image_url
              }
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--muted)]">
        <div className="container-mt grid gap-px bg-[var(--line)] md:grid-cols-2">
          <div className="bg-[var(--background)] p-8 md:p-12">
            <p className="eyebrow mb-4">{t("vision")}</p>
            <p className="text-lg leading-relaxed text-[var(--muted-foreground)] md:text-xl">
              {about.vision}
            </p>
          </div>
          <div className="bg-[var(--background)] p-8 md:p-12">
            <p className="eyebrow mb-4">{t("mission")}</p>
            <p className="text-lg leading-relaxed text-[var(--muted-foreground)] md:text-xl">
              {about.mission}
            </p>
          </div>
        </div>
      </section>

      <ValuesShowcase
        title={t("values")}
        items={about.values.map((v) => ({
          key: v.id,
          icon: v.icon ?? "Sparkles",
          title: v.title,
          description: v.description ?? "",
        }))}
      />

      <section className="section-pad border-y border-[var(--line)] bg-[var(--surface)]">
        <div className="container-mt">
          <SectionHeading title={t("achievements")} />
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {about.stats.map((s) => (
              <div key={s.id} className="border-s border-[var(--line)] ps-5">
                <p className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-semibold tracking-tight text-[var(--primary)]">
                  {s.value}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-mt">
          <div className="max-w-3xl">
          <SectionHeading title={t("ceoMessage")} />
          <blockquote className="border border-[var(--line)] bg-[var(--surface)] p-8 md:p-12">
            <p className="font-display text-[clamp(1.35rem,3vw,1.85rem)] leading-relaxed text-[var(--primary)]">
              “{about.ceo_message}”
            </p>
            <footer className="mt-8 text-sm font-semibold tracking-wide text-[var(--muted-foreground)]">
              {about.ceo_name}
              {about.ceo_title ? ` — ${about.ceo_title}` : null}
            </footer>
          </blockquote>
          </div>
        </div>
      </section>

      <div className="bg-[var(--muted)]">
        <Timeline title={t("timeline")} items={about.timeline} />
      </div>
    </div>
  );
}
