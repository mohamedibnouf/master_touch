import { createAdminClient } from "@/infrastructure/supabase/admin";
import { isSupabaseConfigured } from "@/infrastructure/supabase/config";
import { Card, Label, Textarea } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { ImageUploadField } from "@/presentation/components/admin/ImageUploadField";
import { upsertPageSeoAction } from "@/actions/cms";

const PAGE_SLUGS = ["home", "about", "services", "contact"] as const;

type SeoRow = {
  page_slug: string;
  locale: "ar" | "en";
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image_url: string | null;
  canonical_url: string | null;
  robots: string | null;
  schema_json: unknown;
};

async function loadAllSeo(): Promise<SeoRow[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data: pages } = await admin
    .from("pages")
    .select("id, slug")
    .in("slug", [...PAGE_SLUGS]);
  if (!pages?.length) return [];

  const ids = pages.map((p) => p.id);
  const byId = new Map(pages.map((p) => [p.id, p.slug]));
  const { data: seoRows } = await admin
    .from("page_seo")
    .select(
      "page_id, locale, meta_title, meta_description, meta_keywords, og_title, og_description, og_image_url, twitter_title, twitter_description, twitter_image_url, canonical_url, robots, schema_json",
    )
    .in("page_id", ids);

  return (seoRows ?? []).map((row) => ({
    page_slug: byId.get(row.page_id) ?? "",
    locale: row.locale as "ar" | "en",
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    meta_keywords: row.meta_keywords,
    og_title: row.og_title,
    og_description: row.og_description,
    og_image_url: row.og_image_url,
    twitter_title: row.twitter_title,
    twitter_description: row.twitter_description,
    twitter_image_url: row.twitter_image_url,
    canonical_url: row.canonical_url,
    robots: row.robots,
    schema_json: row.schema_json,
  }));
}

export default async function AdminSeoPage() {
  const all = await loadAllSeo();
  const lookup = (slug: string, locale: "ar" | "en") =>
    all.find((r) => r.page_slug === slug && r.locale === locale) ?? null;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-[var(--primary)]">SEO Manager</h1>
      {PAGE_SLUGS.map((slug) => {
        const en = lookup(slug, "en");
        const ar = lookup(slug, "ar");
        return (
          <Card key={slug} className="space-y-4">
            <h2 className="font-semibold capitalize">{slug}</h2>
            {(["en", "ar"] as const).map((locale) => {
              const seo = locale === "en" ? en : ar;
              return (
                <form
                  key={`${slug}-${locale}`}
                  action={async (formData) => {
                    "use server";
                    await upsertPageSeoAction(formData);
                  }}
                  className="grid gap-3 border-t border-[var(--border)] pt-4 md:grid-cols-2"
                >
                  <input type="hidden" name="page_slug" value={slug} />
                  <input type="hidden" name="locale" value={locale} />
                  <p className="md:col-span-2 text-sm font-medium uppercase text-[var(--muted-foreground)]">
                    {locale}
                  </p>
                  <div>
                    <Label>Meta title</Label>
                    <Input name="meta_title" defaultValue={seo?.meta_title ?? ""} />
                  </div>
                  <div>
                    <Label>Canonical</Label>
                    <Input name="canonical_url" defaultValue={seo?.canonical_url ?? ""} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Meta description</Label>
                    <Textarea name="meta_description" defaultValue={seo?.meta_description ?? ""} />
                  </div>
                  <div>
                    <Label>OG title</Label>
                    <Input name="og_title" defaultValue={seo?.og_title ?? ""} />
                  </div>
                  <ImageUploadField
                    name="og_image_url"
                    label="OG image"
                    defaultValue={seo?.og_image_url}
                  />
                  <div className="md:col-span-2">
                    <Label>OG description</Label>
                    <Textarea name="og_description" defaultValue={seo?.og_description ?? ""} />
                  </div>
                  <div>
                    <Label>Twitter title</Label>
                    <Input name="twitter_title" defaultValue={seo?.twitter_title ?? ""} />
                  </div>
                  <ImageUploadField
                    name="twitter_image_url"
                    label="Twitter image"
                    defaultValue={seo?.twitter_image_url}
                  />
                  <div className="md:col-span-2">
                    <Label>Twitter description</Label>
                    <Textarea name="twitter_description" defaultValue={seo?.twitter_description ?? ""} />
                  </div>
                  <div>
                    <Label>Robots</Label>
                    <Input name="robots" defaultValue={seo?.robots ?? "index,follow"} />
                  </div>
                  <div>
                    <Label>Keywords</Label>
                    <Input name="meta_keywords" defaultValue={seo?.meta_keywords ?? ""} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>JSON-LD (schema_json)</Label>
                    <Textarea
                      name="schema_json"
                      defaultValue={seo?.schema_json ? JSON.stringify(seo.schema_json, null, 2) : ""}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" variant="accent">
                    Save {locale.toUpperCase()}
                  </Button>
                </form>
              );
            })}
          </Card>
        );
      })}
    </div>
  );
}
