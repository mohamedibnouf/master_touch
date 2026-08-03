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
        <div className="container-mt grid gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            {contact.branches.map((b) => (
              <div key={b.id} className="border-s border-[var(--accent)] ps-5">
                <h2 className="text-xl font-semibold text-[var(--primary)]">{b.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {[b.address, b.city, b.country].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
            <div className="space-y-3 border-t border-[var(--line)] pt-8">
              {contact.channels.map((c) => (
                <div key={c.id} className="flex items-start gap-3 py-2">
                  {c.channel_type === "email" ? (
                    <Mail className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden />
                  ) : null}
                  {c.channel_type === "phone" || c.channel_type === "whatsapp" ? (
                    <Phone className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden />
                  ) : null}
                  {c.channel_type === "other" ? (
                    <Globe className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden />
                  ) : null}
                  <div>
                    <p className="text-xs tracking-wide text-[var(--muted-foreground)]">{c.label}</p>
                    <p className="text-sm font-medium break-all text-[var(--foreground)]" dir="ltr">
                      {c.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <ContactMap embedUrl={contact.map_embed_url} />
          </div>
          {contact.is_form_enabled ? (
            <div className="lg:col-span-7">
              <ContactForm successMessage={contact.form_success_message ?? ""} />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
