import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n/config";
import { getContactContent } from "@/infrastructure/repositories/content.repository";
import { ContactMap } from "@/presentation/components/marketing/sections";
import { ContactForm } from "@/presentation/features/contact/ContactForm";
import { Mail, Phone, Globe } from "lucide-react";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const contact = await getContactContent(locale);

  return (
    <div className="pt-20">
      <section className="hero-gradient section-pad text-white">
        <div className="container-mt max-w-3xl">
          <h1 className="font-display text-5xl">{contact.headline}</h1>
          <p className="mt-4 text-white/80">{contact.intro}</p>
        </div>
      </section>
      <section className="section-pad">
        <div className="container-mt grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            {contact.branches.map((b) => (
              <div key={b.id} className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-[var(--primary)]">{b.name}</h2>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {[b.address, b.city, b.country].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
            <div className="grid gap-3">
              {contact.channels.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3">
                  {c.channel_type === "email" ? <Mail className="h-4 w-4 text-[var(--accent)]" /> : null}
                  {c.channel_type === "phone" || c.channel_type === "whatsapp" ? (
                    <Phone className="h-4 w-4 text-[var(--accent)]" />
                  ) : null}
                  {c.channel_type === "other" ? <Globe className="h-4 w-4 text-[var(--accent)]" /> : null}
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">{c.label}</p>
                    <p className="text-sm font-medium" dir="ltr">
                      {c.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <ContactMap embedUrl={contact.map_embed_url} />
          </div>
          {contact.is_form_enabled ? (
            <ContactForm successMessage={contact.form_success_message ?? ""} />
          ) : null}
        </div>
      </section>
    </div>
  );
}
