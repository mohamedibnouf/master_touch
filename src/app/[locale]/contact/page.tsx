import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";
import { getContactContent, getPageSeo } from "@/infrastructure/repositories/content.repository";
import { ContactMap, PageHero } from "@/presentation/components/marketing/sections";
import { ContactForm } from "@/presentation/features/contact/ContactForm";
import { Mail, Phone, Globe } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const contact = await getContactContent(locale as Locale);
  const seo = await getPageSeo("contact", locale as Locale);
  return buildPageMetadata({
    locale: locale as Locale,
    path: "/contact",
    seo,
    fallbackTitle: contact.headline ?? "Contact",
    fallbackDescription: contact.intro ?? "",
  });
}

function channelHref(type: string, value: string) {
  if (type === "email") return `mailto:${value}`;
  if (type === "phone" || type === "fax") return `tel:${value.replace(/\s+/g, "")}`;
  if (type === "whatsapp") {
    const digits = value.replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  }
  if (/^https?:\/\//i.test(value)) return value;
  return null;
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const contact = await getContactContent(locale);

  return (
    <div>
      <PageHero
        title={contact.headline ?? ""}
        subtitle={contact.intro}
        imageSrc="/images/placeholders/hero-3.svg"
      />
      <section className="section-pad">
        <div className="container-mt grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-10 lg:col-span-5">
            {contact.branches.map((b) => (
              <div
                key={b.id}
                className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] md:p-7"
              >
                <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--primary)]">
                  {b.name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {[b.address, b.city, b.country].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] md:p-7">
              {contact.channels.map((c) => {
                const href = channelHref(c.channel_type, c.value);
                const icon =
                  c.channel_type === "email" ? (
                    <Mail className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden />
                  ) : c.channel_type === "phone" || c.channel_type === "whatsapp" ? (
                    <Phone className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden />
                  ) : (
                    <Globe className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden />
                  );
                const body = (
                  <>
                    {icon}
                    <div>
                      <p className="text-xs tracking-wide text-[var(--muted-foreground)]">{c.label}</p>
                      <p className="text-sm font-medium break-all text-[var(--foreground)]" dir="ltr">
                        {c.value}
                      </p>
                    </div>
                  </>
                );
                return href ? (
                  <a
                    key={c.id}
                    href={href}
                    className="flex items-start gap-3 border-b border-[var(--line)] py-3.5 last:border-b-0 transition hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {body}
                  </a>
                ) : (
                  <div key={c.id} className="flex items-start gap-3 border-b border-[var(--line)] py-3.5 last:border-b-0">
                    {body}
                  </div>
                );
              })}
            </div>
            <ContactMap embedUrl={contact.map_embed_url} />
          </div>
          {contact.is_form_enabled ? (
            <div className="lg:col-span-7">
              <ContactForm successMessage={contact.form_success_message ?? ""} />
            </div>
          ) : (
            <div className="lg:col-span-7">
              <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface)] p-10 text-center shadow-[var(--shadow-soft)]">
                <p className="font-semibold text-[var(--primary)]">
                  {locale === "ar" ? "نموذج التواصل غير متاح حالياً" : "Contact form is currently unavailable"}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {locale === "ar"
                    ? "يمكنك التواصل عبر القنوات المدرجة."
                    : "Please use the listed contact channels instead."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
