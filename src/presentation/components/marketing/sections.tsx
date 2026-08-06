"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="mb-14 max-w-2xl md:mb-16"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
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
  alt = "",
  priority,
  sizes,
  className,
}: {
  src: string;
  alt?: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  const isSvg = src.endsWith(".svg");
  return (
    <Image
      src={src}
      alt={alt}
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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (slides.length < 2 || reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(id);
  }, [slides.length, reduceMotion]);

  const slide: HomepageSlide | undefined = slides[index] ?? slides[0];
  const media =
    HERO_BACKGROUNDS[index % HERO_BACKGROUNDS.length] ??
    slide?.media_url ??
    HERO_BACKGROUNDS[0];

  return (
    <section className="relative min-h-[100svh] overflow-hidden text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={media}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <MediaFill
            src={media}
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>
      {/* Premium dark engineering veil — hero-only gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(6,16,28,0.88)_0%,rgba(10,27,51,0.72)_42%,rgba(30,94,255,0.28)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,16,28,0.75)_0%,transparent_45%)]" />

      <div className="relative container-mt flex min-h-[100svh] flex-col justify-end px-[var(--page-gutter)] pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+3rem))] pt-[calc(var(--header-height)+2.5rem+env(safe-area-inset-top,0px))] md:justify-center md:pb-28">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.08 }}
          className="eyebrow mb-5 text-white"
        >
          {locale === "ar" ? "حلول هندسية متكاملة" : "Integrated engineering solutions"}
        </motion.p>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.14 }}
          className="text-sm font-medium tracking-[0.08em] text-white/75 md:text-base"
        >
          {section.title}
        </motion.p>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide?.id ?? "fallback"}
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xl"
          >
            <h1 className="font-display text-display font-semibold tracking-tight text-white">
              {slide?.title ?? section.subtitle}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/70 md:text-lg">
              {slide?.subtitle ?? section.body}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href={resolveHref(locale, slide?.link_url ?? section.cta_href)}>
                <Button variant="accent" size="lg">
                  {slide?.cta_label ?? section.cta_label}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link href={`/${locale}/services`}>
                <Button variant="light" size="lg">
                  {locale === "ar" ? "استعرض الخدمات" : "Explore services"}
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
                className="inline-flex min-h-11 min-w-11 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <span
                  className={cn(
                    "h-px transition-all duration-500",
                    i === index ? "w-12 bg-[var(--accent)]" : "w-6 bg-white/35",
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
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
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
                className="min-w-0 border-s-2 border-[var(--accent)]/35 ps-6"
              >
                <p className="font-display text-[clamp(2.5rem,5.5vw,3.85rem)] font-semibold tracking-tight text-[var(--primary)]">
                  <AnimatedStatValue value={item.value} />
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-[0.95rem]">
                  {item.label}
                </p>
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
  const locale = useLocale();
  return (
    <section className="values-blueprint section-pad">
      <div className="container-mt">
        <div className="mb-14 flex flex-col gap-8 md:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow mb-4">{locale === "ar" ? "المواصفات" : "Specifications"}</p>
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
              {String(items.length).padStart(2, "0")}{" "}
              {locale === "ar" ? "وحدات" : "modules"}
            </span>
          </motion.div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: reduceMotion ? 0 : Math.min(index, 5) * 0.07,
        duration: reduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
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
              alt={service.title}
              sizes={
                featured
                  ? "(max-width:768px) 100vw, 50vw"
                  : "(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
              }
              className="object-cover"
            />
          ) : (
            <div className="flex h-full min-h-52 items-center justify-center bg-[linear-gradient(145deg,#06101c,#132a4a)]">
              <Icon className="h-10 w-10 text-[var(--accent)]" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[rgba(6,16,28,0.55)] via-transparent to-transparent opacity-80 transition duration-500 group-hover:opacity-95" />
          <div className="service-module__grid" aria-hidden />
          <span className="service-module__code">{code}</span>
        </div>

        <div className="relative flex flex-col justify-between p-7 md:p-9">
          <div>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="value-module__icon !my-0 text-[var(--accent)]">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <span className="font-display text-[0.65rem] tracking-[0.2em] text-[var(--muted-foreground)]">
                {code}
              </span>
            </div>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-[var(--primary)] transition group-hover:text-[var(--accent)] md:text-[1.7rem]">
              {service.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-[0.975rem]">
              {service.summary}
            </p>
          </div>

          <div className="mt-9 flex min-w-0 items-center justify-between gap-3 border-t border-[var(--line)] pt-6">
            <span className="min-w-0 text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[var(--primary)]/55 transition group-hover:text-[var(--accent)] rtl:tracking-normal">
              {locale === "ar" ? "استكشف الخدمة" : "Explore system"}
            </span>
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--line)] text-[var(--primary)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white">
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
  const reduceMotion = useReducedMotion();
  return (
    <section className="section-pad">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: reduceMotion ? 0 : 0.6 }}
        className="cta-engineering container-mt"
      >
        <div className="cta-engineering__grid" aria-hidden />
        <div className="cta-engineering__beam" aria-hidden />
        <div className="cta-engineering__frame" aria-hidden />

        <div className="relative z-[3] grid gap-10 px-[clamp(1.5rem,4.5vw,3.75rem)] py-[clamp(3rem,7.5vw,5.5rem)] lg:grid-cols-12 lg:items-end">
          <div className="min-w-0 lg:col-span-8">
            <div className="mb-7 flex flex-wrap items-center gap-3">
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
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                {section.subtitle}
              </p>
            ) : null}

            {section.cta_href ? (
              <div className="mt-10 flex flex-wrap items-center gap-4">
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
            <div className="ms-auto max-w-[15rem] border border-white/15 bg-white/[0.04] p-6 backdrop-blur-[2px]">
              <p className="font-display text-[0.65rem] tracking-[0.2em] text-[var(--accent)]">SPEC</p>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {locale === "ar"
                  ? "دقة التنفيذ · جودة المواد · التزام بالمواعيد"
                  : "Execution precision · Material quality · On-time delivery"}
              </p>
              <div className="mt-6 flex items-center gap-2">
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
              <Button variant="outline" size="lg">
                {section.cta_label}
              </Button>
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
      <div className="container-mt grid gap-6 md:grid-cols-2">
        {[vision, mission].map((block, i) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)] md:p-12"
          >
            <p className="eyebrow mb-5">{block.title}</p>
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
      <div className="container-mt grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionHeading title={section.title} subtitle={section.subtitle} />
          <p className="text-lg leading-relaxed text-[var(--muted-foreground)] md:text-xl">
            {section.body}
          </p>
          {section.cta_href ? (
            <Link href={resolveHref(locale, section.cta_href)} className="mt-10 inline-block">
              <Button variant="outline" size="lg">
                {section.cta_label}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          ) : null}
        </motion.div>
        <motion.div
          className="image-frame relative min-h-[24rem] overflow-hidden shadow-[var(--shadow-soft)] lg:col-span-6 lg:min-h-[32rem]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <MediaFill
            src={resolveAboutCover(coverUrl)}
            alt={section.title ?? "Master Touch"}
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
        <div className="mb-14 flex flex-col gap-8 md:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow mb-4">{locale === "ar" ? "الأنظمة" : "Systems"}</p>
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
              {String(services.length).padStart(2, "0")}{" "}
              {locale === "ar" ? "تخصصات" : "disciplines"}
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
              className="grid gap-4 border-t border-[var(--line)] py-10 md:grid-cols-12 md:gap-10 md:py-12"
            >
              <p className="font-display text-2xl font-semibold tracking-tight text-[var(--accent)] md:col-span-2 md:text-3xl">
                {item.event_year}
              </p>
              <div className="md:col-span-10">
                <h3 className="font-display text-xl font-semibold tracking-tight text-[var(--primary)] md:text-[1.35rem]">
                  {item.title}
                </h3>
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
  const reduceMotion = useReducedMotion();
  return (
    <section className="page-hero">
      <MediaFill src={imageSrc} alt="" priority sizes="100vw" />
      <div className="container-mt">
        <div className="max-w-3xl">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6 }}
            className="font-display text-h1 font-semibold tracking-tight"
          >
            {title}
          </motion.h1>
          {subtitle ? (
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.12 }}
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
