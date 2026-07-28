import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/infrastructure/repositories/content.repository";
import { Card, Label } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { saveModuleAction } from "@/actions/cms";

export default async function AdminSettingsPage() {
  const site = await getSiteSettings();
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("settings")}</h1>
      <Card className="grid max-w-xl gap-3">
        <div>
          <Label htmlFor="site-en">{t("siteNameEn")}</Label>
          <Input id="site-en" defaultValue={site.site_name_i18n.en} />
        </div>
        <div>
          <Label htmlFor="site-ar">{t("siteNameAr")}</Label>
          <Input id="site-ar" defaultValue={site.site_name_i18n.ar} dir="rtl" />
        </div>
        <div>
          <Label htmlFor="website">{t("websiteUrl")}</Label>
          <Input id="website" defaultValue={site.website_url ?? ""} />
        </div>
        <div>
          <Label htmlFor="locale">{t("defaultLocale")}</Label>
          <Input id="locale" defaultValue={site.default_locale} />
        </div>
        <form
          action={async () => {
            "use server";
            await saveModuleAction("settings", { saved: true });
          }}
        >
          <Button type="submit" variant="accent">
            {t("saveSettings")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
