"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import type { AboutValue, HomepageSection, HomepageSlide, ServiceItem } from "@/types/cms";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Award,
  Building2,
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
  Settings2,
  ArrowUpRight,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Building2,
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
  Settings2,
};

export function SectionHeading({
  title,
  subtitle,
  light,
  eyebrow,
}: {
  title?: string | null;
  subtitle?: string | null;
  light?: boolean;
  eyebrow?: string | null;
}) {
  return (
    <motion.div
      className="mb-12 max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <h2
        className={cn(
          "font-display text-h2 font-semibold tracking-tight",
          light ? "text-white" : "text-[var(--primary)]",
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed md:text-lg",
            light ? "text-white/70" : "text-[var(--muted-foreground)]",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </motion.div>
  );
}

function resolveHref(locale: string, href?: string | null) {
  if (!href) return `/${locale}/contact`;
  if (href.startsWith("http")) return href;
  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}

function resolveAboutCover(url?: string | null) {
  if (!url || url.includes("placeholders/about-cover")) {
    return "/images/about-company.png";
  }
  return url;
}

function MediaFill({
  src,
  priority,
  sizes,
  className,
}: {
  src: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  const isSvg = src.endsWith(".svg");
  return (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      sizes={sizes}
      unoptimized={isSvg}
      className={className ?? "object-cover"}
    />
  );
}

const HERO_BACKGROUNDS = [
  "/images/hero-architecture.png",
  "/images/hero-architecture-2.png",
  "/images/hero-architecture-3.png",
] as const;

export function HeroSlider({
  section,
  locale,
}: {
  section: HomepageSection;
  locale: string;
}) {
  const slides = useMemo(
    () => (section.slides?.filter((s) => s.is_enabled) ?? []).sort((a, b) => a.sort_order - b.sort_order),
    [section.slides],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(id);
  }, [slides.length]);

  const slide: HomepageSlide | undefined = slides[index] ?? slides[0];
  const media =
    HERO_BACKGROUNDS[index % HERO_BACKGROUNDS.length] ??
    slide?.media_url ??
    HERO_BACKGROUNDS[0];

  return (
    <section className="relative min-h-[100svh] overflow-hidden text-[var(--primary)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={media}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <MediaFill
            src={media}
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>
      {/* Soft top veil so fixed white nav stays readable; keep the architecture visible */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,16,28,0.55)_0%,rgba(6,16,28,0.12)_18%,rgba(255,255,255,0.2)_42%,rgba(247,245,242,0.55)_100%)]" />

      <div className="relative container-mt flex min-h-[100svh] flex-col justify-end px-[var(--page-gutter)] pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+3rem))] pt-[calc(var(--header-height)+2rem+env(safe-area-inset-top,0px))] md:justify-center md:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-display font-semibold leading-[0.95] tracking-tight text-[var(--primary)]"
        >
          {section.title}
        </motion.p>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide?.id ?? "fallback"}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-xl"
          >
            <h1 className="text-xl font-medium text-[var(--primary)] md:text-2xl">
              {slide?.title ?? section.subtitle}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
              {slide?.subtitle ?? section.body}
            </p>
            <div className="mt-9">
              <Link href={resolveHref(locale, slide?.link_url ?? section.cta_href)}>
                <Button variant="accent" size="lg">
                  {slide?.cta_label ?? section.cta_label}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 ? (
          <div className="mt-12 flex items-center gap-1" role="tablist" aria-label="Hero slides">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <span
                  className={cn(
                    "h-px transition-all duration-500",
                    i === index ? "w-12 bg-[var(--accent)]" : "w-6 bg-[var(--primary)]/25",
                  )}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function parseStat(value: string) {
  const match = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
  if (!match) return { prefix: "", number: 0, suffix: value, decimals: 0 };
  const raw = match[2].replace(/,/g, "");
  const decimals = raw.includes(".") ? (raw.split(".")[1]?.length ?? 0) : 0;
  return {
    prefix: match[1],
    number: Number(raw),
    suffix: match[3],
    decimals,
  };
}

function AnimatedStatValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const parsed = parseStat(value);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 20 });
  const isStatic = !Number.isFinite(parsed.number) || parsed.number === 0;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || isStatic) return;
    motionValue.set(0);
    motionValue.set(parsed.number);
  }, [inView, isStatic, motionValue, parsed.number]);

  useEffect(() => {
    if (isStatic) return;
    return spring.on("change", (latest) => {
      const formatted =
        parsed.decimals > 0 ? latest.toFixed(parsed.decimals) : Math.round(latest).toString();
      setDisplay(`${parsed.prefix}${formatted}${parsed.suffix}`);
    });
  }, [isStatic, parsed.decimals, parsed.prefix, parsed.suffix, spring]);

  return (
    <span ref={ref} className="stat-value">
      {isStatic ? value : display}
    </span>
  );
}

export function StatsCounter({
  section,
  items: itemsProp,
}: {
  section: HomepageSection;
  items?: Array<{ value: string; label: string; id?: string }>;
}) {
  const fromSettings =
    (section.settings as { items?: Array<{ value: string; label: string }> })?.items ?? [];
  const items = itemsProp?.length ? itemsProp : fromSettings;

  if (!items.length) return null;

  return (
    <section className="section-pad border-y border-[var(--line)] bg-[var(--surface)]">
      <div className="container-mt">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const itemKey =
              "id" in item && typeof item.id === "string" ? item.id : `${item.label}-${i}`;
            return (
              <motion.div
                key={itemKey}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="border-s border-[var(--line)] ps-5 min-w-0"
              >
                <p className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold tracking-tight text-[var(--primary)]">
                  <AnimatedStatValue value={item.value} />
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ValuesGrid({
  section,
  items: itemsProp,
}: {
  section: HomepageSection;
  items?: AboutValue[];
}) {
  const fromSettings =
    (section.settings as {
      items?: Array<{ icon: string; title: string; description: string }>;
    })?.items ?? [];

  const items =
    itemsProp?.length
      ? itemsProp.map((v) => ({
          icon: v.icon ?? "Sparkles",
          title: v.title,
          description: v.description ?? "",
          key: v.id,
        }))
      : fromSettings.map((v) => ({ ...v, key: v.title }));

  if (!items.length) return null;

  return (
    <ValuesShowcase
      title={section.title}
      subtitle={section.subtitle}
      items={items}
    />
  );
}

export function ValuesShowcase({
  title,
  subtitle,
  items,
}: {
  title?: string | null;
  subtitle?: string | null;
  items: Array<{ key: string; icon: string; title: string; description: string }>;
}) {
  return (
    <section className="values-blueprint section-pad">
      <div className="container-mt">
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow mb-4">Specifications</p>
            <h2 className="font-display text-h2 font-semibold tracking-tight text-[var(--primary)]">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
                {subtitle}
              </p>
            ) : null}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden items-center gap-3 pb-2 text-[0.65rem] font-semibold tracking-[0.22em] uppercase text-[var(--muted-foreground)] sm:flex"
            aria-hidden
          >
            <span className="inline-block h-8 w-8 border border-[var(--line)]" />
            <span>
              {String(items.length).padStart(2, "0")} modules
            </span>
          </motion.div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] ?? Sparkles;
            const index = String(i + 1).padStart(2, "0");
            return (
              <motion.article
                key={item.key}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="value-module group"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="value-module__index" aria-hidden>
                    {index}
                  </span>
                  <span
                    className="h-px flex-1 translate-y-2 bg-[var(--line)] transition group-hover:bg-[color-mix(in_oklab,var(--accent)_55%,transparent)]"
                    aria-hidden
                  />
                  <span className="font-display text-[0.65rem] tracking-[0.16em] text-[var(--muted-foreground)]">
                    VAL
                  </span>
                </div>

                <div className="value-module__icon" aria-hidden>
                  <Icon className="h-5 w-5 transition duration-500 group-hover:text-[var(--accent)]" />
                </div>

                <h3 className="font-display text-xl font-semibold tracking-tight text-[var(--primary)] md:text-[1.35rem]">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {item.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[var(--primary)]/45 transition group-hover:text-[var(--accent)]">
                  <span className="inline-block h-px w-6 bg-current" aria-hidden />
                  Spec {index}
                </div>
              </motion.article>
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
  featured,
  index = 0,
}: {
  service: ServiceItem;
  locale: string;
  featured?: boolean;
  index?: number;
}) {
  const Icon = iconMap[service.icon ?? ""] ?? BriefcaseFallback;
  const cover = service.cover_image_url;
  const code = `SRV-${String(index + 1).padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index, 5) * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(featured ? "md:col-span-2" : "")}
    >
      <Link
        href={`/${locale}/services/${service.slug}`}
        className={cn(
          "service-module group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          featured ? "md:grid md:grid-cols-2 md:min-h-[22rem]" : "",
        )}
      >
        <div
          className={cn(
            "service-module__media relative",
            featured ? "min-h-48 sm:min-h-56 md:min-h-full md:aspect-auto" : "min-h-44 sm:min-h-52",
          )}
        >
          {cover ? (
            <MediaFill
              src={cover}
              sizes={featured ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 100vw, 50vw"}
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full min-h-52 items-center justify-center bg-[linear-gradient(145deg,#06101c,#14304f)]">
              <Icon className="h-12 w-12 text-[var(--accent)]" />
            </div>
          )}
          <div className="service-module__grid" aria-hidden />
          <span className="service-module__code">{code}</span>
        </div>

        <div className="relative flex flex-col justify-between p-6 md:p-8">
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="value-module__icon !my-0 text-[var(--accent)]">
                <Icon className="h-5 w-5 transition duration-500 group-hover:scale-110" aria-hidden />
              </div>
              <span className="font-display text-[0.65rem] tracking-[0.2em] text-[var(--muted-foreground)]">
                {code}
              </span>
            </div>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-[var(--primary)] transition group-hover:text-[var(--accent)] md:text-[1.65rem]">
              {service.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-[0.95rem]">
              {service.summary}
            </p>
          </div>

          <div className="mt-8 flex min-w-0 items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
            <span className="min-w-0 text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[var(--primary)]/55 transition group-hover:text-[var(--accent)] rtl:tracking-normal">
              {locale === "ar" ? "استكشف الخدمة" : "Explore system"}
            </span>
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--line)] text-[var(--primary)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function BriefcaseFallback({ className }: { className?: string }) {
  return <BriefcaseIcon className={className} />;
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function CtaBanner({ section, locale }: { section: HomepageSection; locale: string }) {
  return (
    <section className="section-pad">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="cta-engineering container-mt"
      >
        <div className="cta-engineering__grid" aria-hidden />
        <div className="cta-engineering__beam" aria-hidden />
        <div className="cta-engineering__frame" aria-hidden />

        <div className="relative z-[3] grid gap-10 px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.75rem,7vw,5rem)] lg:grid-cols-12 lg:items-end">
          <div className="min-w-0 lg:col-span-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <p className="eyebrow mb-0 text-[var(--accent)]">
                {locale === "ar" ? "ابدأ معنا" : "Engage"}
              </p>
              <span className="hidden h-px w-10 bg-white/20 sm:block" aria-hidden />
              <span className="font-display text-[0.65rem] tracking-[0.2em] text-white/45">
                CTA-01
              </span>
            </div>

            <h2 className="font-display text-h2 max-w-xl font-semibold tracking-tight text-balance rtl:max-w-2xl">
              {section.title}
            </h2>
            {section.subtitle ? (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                {section.subtitle}
              </p>
            ) : null}

            {section.cta_href ? (
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href={resolveHref(locale, section.cta_href)}>
                  <Button variant="accent" size="lg" className="min-w-[10.5rem]">
                    {section.cta_label}
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
                <span className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-white/40">
                  {locale === "ar" ? "استشارة هندسية" : "Engineering consult"}
                </span>
              </div>
            ) : null}
          </div>

          <div className="hidden min-w-0 lg:col-span-4 lg:block">
            <div className="ms-auto max-w-[14rem] border border-white/15 bg-white/[0.03] p-5 backdrop-blur-[2px]">
              <p className="font-display text-[0.65rem] tracking-[0.2em] text-[var(--accent)]">SPEC</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {locale === "ar"
                  ? "دقة التنفيذ · جودة المواد · التزام بالمواعيد"
                  : "Execution precision · Material quality · On-time delivery"}
              </p>
              <div className="mt-5 flex items-center gap-2">
                <span className="h-px flex-1 bg-white/15" aria-hidden />
                <span className="font-display text-[0.65rem] tracking-[0.16em] text-white/40">MT</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function ContactMap({ embedUrl }: { embedUrl: string | null }) {
  if (!embedUrl) return null;
  return (
    <div className="overflow-hidden border border-[var(--line)]">
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
      <div className="container-mt">
        <div className="max-w-3xl">
          <SectionHeading title={section.title} subtitle={section.subtitle} />
          {section.body ? (
            <p className="text-lg leading-relaxed text-[var(--muted-foreground)]">{section.body}</p>
          ) : null}
          {section.cta_href && section.cta_label ? (
            <Link href={section.cta_href} className="mt-6 inline-block">
              <Button variant="outline">{section.cta_label}</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function VisionMissionPair({
  vision,
  mission,
}: {
  vision: HomepageSection;
  mission: HomepageSection;
}) {
  return (
    <section className="section-pad bg-[var(--muted)]">
      <div className="container-mt grid gap-px bg-[var(--line)] md:grid-cols-2">
        {[vision, mission].map((block, i) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-[var(--background)] p-8 md:p-12"
          >
            <p className="eyebrow mb-4">{block.title}</p>
            <p className="text-lg leading-relaxed text-[var(--muted-foreground)] md:text-xl">
              {block.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function AboutIntro({
  section,
  locale,
  coverUrl,
}: {
  section: HomepageSection;
  locale: string;
  coverUrl?: string | null;
}) {
  return (
    <section className="section-pad">
      <div className="container-mt grid items-center gap-12 lg:grid-cols-12">
        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionHeading title={section.title} subtitle={section.subtitle} />
          <p className="text-lg leading-relaxed text-[var(--muted-foreground)]">{section.body}</p>
          {section.cta_href ? (
            <Link href={resolveHref(locale, section.cta_href)} className="mt-8 inline-block">
              <Button variant="outline">
                {section.cta_label}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          ) : null}
        </motion.div>
        <motion.div
          className="image-frame relative min-h-[22rem] overflow-hidden rounded-2xl lg:col-span-6"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <MediaFill
            src={resolveAboutCover(coverUrl)}
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        </motion.div>
      </div>
    </section>
  );
}

export function ServicesShowcase({
  section,
  services,
  locale,
}: {
  section: HomepageSection;
  services: ServiceItem[];
  locale: string;
}) {
  return (
    <section className="services-engineering section-pad">
      <div className="container-mt">
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow mb-4">Systems</p>
            <h2 className="font-display text-h2 font-semibold tracking-tight text-[var(--primary)]">
              {section.title}
            </h2>
            {section.subtitle ? (
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
                {section.subtitle}
              </p>
            ) : null}
          </motion.div>
          <div className="flex flex-wrap items-center gap-4 lg:pb-2">
            <span className="hidden text-[0.65rem] font-semibold tracking-[0.22em] uppercase text-[var(--muted-foreground)] sm:inline">
              {String(services.length).padStart(2, "0")} disciplines
            </span>
            {section.cta_href ? (
              <Link href={resolveHref(locale, section.cta_href)}>
                <Button variant="outline">
                  {section.cta_label}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
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
  );
}

export function Timeline({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; event_year: string | null; title: string; description: string | null }>;
}) {
  return (
    <section className="section-pad">
      <div className="container-mt">
        <SectionHeading title={title} />
        <ol className="relative space-y-0">
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="grid gap-4 border-t border-[var(--line)] py-10 md:grid-cols-12 md:gap-8"
            >
              <p className="font-display text-3xl font-semibold text-[var(--accent)] md:col-span-2">
                {item.event_year}
              </p>
              <div className="md:col-span-10">
                <h3 className="text-xl font-semibold text-[var(--primary)]">{item.title}</h3>
                {item.description ? (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PageHero({
  title,
  subtitle,
  imageSrc = "/images/placeholders/hero-1.svg",
}: {
  title: string;
  subtitle?: string | null;
  imageSrc?: string;
}) {
  return (
    <section className="page-hero">
      <MediaFill src={imageSrc} priority sizes="100vw" />
      <div className="container-mt">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-h1 font-semibold tracking-tight"
          >
            {title}
          </motion.h1>
          {subtitle ? (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg"
            >
              {subtitle}
            </motion.p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
