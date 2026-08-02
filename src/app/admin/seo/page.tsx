import { createAdminClient } from "@/infrastructure/supabase/admin";
import { isSupabaseConfigured } from "@/infrastructure/supabase/config";
import { Card, Label, Textarea } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { ImageUploadField } from "@/presentation/components/admin/ImageUploadField";
import { upsertPageSeoAction } from "@/actions/cms";

const PAGE_SLUGS = ["home", "about", "services", "contact"] as const;

async function loadSeo(slug: string, locale: "ar" | "en") {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data: page } = await admin.from("pages").select("id").eq("slug", slug).maybeSingle();
  if (!page) return null;
  const { data: seo } = await admin
    .from("page_seo")
    .select("*")
    .eq("page_id", page.id)
    .eq("locale", locale)
    .maybeSingle();
  return seo;
}

export default async function AdminSeoPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-[var(--primary)]">SEO Manager</h1>
      {await Promise.all(
        PAGE_SLUGS.map(async (slug) => {
          const en = await loadSeo(slug, "en");
          const ar = await loadSeo(slug, "ar");
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
                    <p className="md:col-span-2 text-sm font-medium uppercase text-[var(--muted-foreground)]">{locale}</p>
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
                      Save {slug} ({locale})
                    </Button>
                  </form>
                );
              })}
            </Card>
          );
        }),
      )}
    </div>
  );
}
