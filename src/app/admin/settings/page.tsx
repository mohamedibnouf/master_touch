import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/infrastructure/repositories/content.repository";
import { Card, Label } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { updateSiteSettingsAction } from "@/actions/cms";

export default async function AdminSettingsPage() {
  const site = await getSiteSettings();
  const t = await getTranslations("admin");
  const nameEn = site.site_name_i18n.en ?? "";
  const nameAr = site.site_name_i18n.ar ?? "";

  async function save(formData: FormData) {
    "use server";
    await updateSiteSettingsAction({
      site_name_en: String(formData.get("site_name_en") ?? ""),
      site_name_ar: String(formData.get("site_name_ar") ?? ""),
      website_url: String(formData.get("website_url") ?? ""),
      default_locale: String(formData.get("default_locale") ?? "ar") === "en" ? "en" : "ar",
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("settings")}</h1>
      <form action={save} className="space-y-4">
        <Card className="grid max-w-xl gap-3">
          <div>
            <Label htmlFor="site_name_en">Site name (EN)</Label>
            <Input id="site_name_en" name="site_name_en" defaultValue={nameEn} />
          </div>
          <div>
            <Label htmlFor="site_name_ar">Site name (AR)</Label>
            <Input id="site_name_ar" name="site_name_ar" defaultValue={nameAr} dir="rtl" />
          </div>
          <div>
            <Label htmlFor="website_url">Website URL</Label>
            <Input id="website_url" name="website_url" defaultValue={site.website_url ?? ""} />
          </div>
          <div>
            <Label htmlFor="default_locale">Default locale</Label>
            <select
              id="default_locale"
              name="default_locale"
              defaultValue={site.default_locale}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              <option value="ar">ar</option>
              <option value="en">en</option>
            </select>
          </div>
          <Button type="submit" variant="accent">
            {t("save")}
          </Button>
        </Card>
      </form>
    </div>
  );
}
