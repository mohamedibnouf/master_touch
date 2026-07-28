"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { HomepageSection, HomepageSlide, ServiceItem } from "@/types/cms";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Award,
  Clock,
  ShieldCheck,
  Sparkles,
  HardHat,
  Headset,
  Zap,
  Paintbrush,
  Cpu,
  Wrench,
  CheckCircle2,
  Smile,
  TrendingUp,
  Target,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Clock,
  ShieldCheck,
  Sparkles,
  HardHat,
  Headset,
  Zap,
  Paintbrush,
  Cpu,
  Wrench,
  CheckCircle2,
  Smile,
  TrendingUp,
  Target,
};

export function SectionHeading({
  title,
  subtitle,
  light,
}: {
  title?: string | null;
  subtitle?: string | null;
  light?: boolean;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <h2
        className={cn(
          "font-display text-4xl font-semibold tracking-tight md:text-5xl",
          light ? "text-white" : "text-[var(--primary)]",
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className={cn("mt-3 text-base md:text-lg", light ? "text-white/75" : "text-[var(--muted-foreground)]")}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function HeroSlider({
  section,
  locale,
}: {
  section: HomepageSection;
  locale: string;
}) {
  const slides = section.slides?.filter((s) => s.is_enabled) ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide: HomepageSlide | undefined = slides[index] ?? slides[0];

  return (
    <section className="relative min-h-[100svh] overflow-hidden hero-gradient text-white">
      <div className="absolute inset-0 bg-[url('/images/placeholders/hero-1.svg')] bg-cover bg-center opacity-25" />
      <div className="relative container-mt flex min-h-[100svh] flex-col justify-end px-4 pb-20 pt-32 md:justify-center md:pb-0">
        <p className="font-display text-5xl font-semibold md:text-7xl lg:text-8xl">
          {section.title}
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide?.id ?? "fallback"}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="mt-6 max-w-2xl"
          >
            <p className="text-xl text-[var(--accent)] md:text-2xl">{slide?.title ?? section.subtitle}</p>
            <p className="mt-4 text-base text-white/80 md:text-lg">
              {slide?.subtitle ?? section.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${locale}${slide?.link_url ?? section.cta_href ?? "/contact"}`}>
                <Button variant="accent" size="lg">
                  {slide?.cta_label ?? section.cta_label}
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
        {slides.length > 1 ? (
          <div className="mt-10 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 w-8 rounded-full transition",
                  i === index ? "bg-[var(--accent)]" : "bg-white/30",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function StatsCounter({ section }: { section: HomepageSection }) {
  const items =
    (section.settings as { items?: Array<{ value: string; label: string }> })?.items ?? [];

  return (
    <section className="section-pad bg-[var(--muted)]">
      <div className="container-mt">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <p className="font-display text-4xl font-semibold text-[var(--accent)]">{item.value}</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ValuesGrid({ section }: { section: HomepageSection }) {
  const items =
    (section.settings as {
      items?: Array<{ icon: string; title: string; description: string }>;
    })?.items ?? [];

  return (
    <section className="section-pad">
      <div className="container-mt">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = iconMap[item.icon] ?? Sparkles;
            return (
              <div key={item.title} className="glass rounded-2xl p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--primary)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ServiceCard({
  service,
  locale,
}: {
  service: ServiceItem;
  locale: string;
}) {
  const Icon = iconMap[service.icon ?? ""] ?? BriefcaseFallback;
  return (
    <Link
      href={`/${locale}/services/${service.slug}`}
      className="glass group block overflow-hidden rounded-2xl transition hover:-translate-y-1"
    >
      <div className="h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] p-6 text-white">
        <Icon className="h-8 w-8 text-[var(--accent)]" />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[var(--primary)] group-hover:text-[var(--accent)]">
          {service.title}
        </h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{service.summary}</p>
      </div>
    </Link>
  );
}

function BriefcaseFallback({ className }: { className?: string }) {
  return <BriefcaseIcon className={className} />;
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function CtaBanner({ section, locale }: { section: HomepageSection; locale: string }) {
  return (
    <section className="section-pad">
      <div className="container-mt overflow-hidden rounded-3xl hero-gradient px-8 py-14 text-white md:px-14">
        <h2 className="font-display text-4xl md:text-5xl">{section.title}</h2>
        <p className="mt-4 max-w-xl text-white/80">{section.subtitle}</p>
        {section.cta_href ? (
          <Link href={`/${locale}${section.cta_href}`} className="mt-8 inline-block">
            <Button variant="accent" size="lg">
              {section.cta_label}
            </Button>
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function ContactMap({ embedUrl }: { embedUrl: string | null }) {
  if (!embedUrl) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
      <iframe
        title="Master Touch map"
        src={embedUrl}
        className="h-80 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export function TextBlock({ section }: { section: HomepageSection }) {
  return (
    <section className="section-pad">
      <div className="container-mt max-w-3xl">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        {section.body ? <p className="text-lg leading-relaxed text-[var(--muted-foreground)]">{section.body}</p> : null}
        {section.cta_href && section.cta_label ? (
          <Link href={section.cta_href} className="mt-6 inline-block">
            <Button variant="outline">{section.cta_label}</Button>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
