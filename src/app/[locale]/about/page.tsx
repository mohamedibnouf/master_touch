import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";
import { getAboutContent, getPageSeo } from "@/infrastructure/repositories/content.repository";
import { SectionHeading } from "@/presentation/components/marketing/sections";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import {
  Award,
  Clock,
  ShieldCheck,
  Sparkles,
  HardHat,
  Headset,
} from "lucide-react";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Clock,
  ShieldCheck,
  Sparkles,
  HardHat,
  Headset,
};

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

  return (
    <div className="pt-20">
      <section className="hero-gradient section-pad text-white">
        <div className="container-mt max-w-3xl">
          <h1 className="font-display text-5xl md:text-6xl">{t("aboutTitle")}</h1>
          <p className="mt-4 text-white/80">
            {about.history ? `${about.history.slice(0, 160)}…` : null}
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-mt max-w-3xl">
          <SectionHeading title={t("aboutStory")} />
          <p className="text-lg leading-relaxed text-[var(--muted-foreground)]">{about.history}</p>
        </div>
      </section>

      <section className="section-pad bg-[var(--muted)]">
        <div className="container-mt grid gap-8 md:grid-cols-2">
          <div className="glass rounded-2xl p-8">
            <h2 className="font-display text-3xl text-[var(--primary)]">{t("vision")}</h2>
            <p className="mt-4 text-[var(--muted-foreground)]">{about.vision}</p>
          </div>
          <div className="glass rounded-2xl p-8">
            <h2 className="font-display text-3xl text-[var(--primary)]">{t("mission")}</h2>
            <p className="mt-4 text-[var(--muted-foreground)]">{about.mission}</p>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-mt">
          <SectionHeading title={t("values")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {about.values.map((v) => {
              const Icon = icons[v.icon ?? ""] ?? Sparkles;
              return (
                <div key={v.id} className="glass rounded-2xl p-6">
                  <Icon className="mb-3 h-6 w-6 text-[var(--accent)]" aria-hidden />
                  <h3 className="font-semibold text-[var(--primary)]">{v.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--muted)]">
        <div className="container-mt">
          <SectionHeading title={t("achievements")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.stats.map((s) => (
              <div key={s.id} className="glass rounded-2xl p-6 text-center">
                <p className="font-display text-4xl text-[var(--accent)]">{s.value}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-mt max-w-3xl">
          <SectionHeading title={t("ceoMessage")} />
          <blockquote className="glass rounded-2xl p-8 text-lg leading-relaxed text-[var(--muted-foreground)]">
            “{about.ceo_message}”
            <footer className="mt-6 text-base font-semibold text-[var(--primary)]">
              {about.ceo_name} — {about.ceo_title}
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="section-pad bg-[var(--muted)]">
        <div className="container-mt">
          <SectionHeading title={t("timeline")} />
          <ol className="space-y-6 border-s-2 border-[var(--accent)] ps-6">
            {about.timeline.map((item) => (
              <li key={item.id}>
                <p className="text-sm font-semibold text-[var(--accent)]">{item.event_year}</p>
                <h3 className="text-lg font-semibold text-[var(--primary)]">{item.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
