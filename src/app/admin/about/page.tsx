import { getTranslations } from "next-intl/server";
import { getAboutContent } from "@/infrastructure/repositories/content.repository";
import { Card, Label, Textarea } from "@/presentation/components/ui/primitives";
import { Button } from "@/presentation/components/ui/button";
import { saveModuleAction } from "@/actions/cms";

export default async function AdminAboutPage() {
  const about = await getAboutContent("en");
  const aboutAr = await getAboutContent("ar");
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("about")}</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">{t("english")}</h2>
          <Label htmlFor="history-en">{t("history")}</Label>
          <Textarea id="history-en" defaultValue={about.history ?? ""} className="mb-3" />
          <Label htmlFor="vision-en">{t("visionField")}</Label>
          <Textarea id="vision-en" defaultValue={about.vision ?? ""} className="mb-3" />
          <Label htmlFor="mission-en">{t("missionField")}</Label>
          <Textarea id="mission-en" defaultValue={about.mission ?? ""} className="mb-3" />
          <Label htmlFor="ceo-en">{t("ceoMessageField")}</Label>
          <Textarea id="ceo-en" defaultValue={about.ceo_message ?? ""} />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">{t("arabic")}</h2>
          <Label htmlFor="history-ar">{t("history")}</Label>
          <Textarea id="history-ar" defaultValue={aboutAr.history ?? ""} className="mb-3" dir="rtl" />
          <Label htmlFor="vision-ar">{t("visionField")}</Label>
          <Textarea id="vision-ar" defaultValue={aboutAr.vision ?? ""} className="mb-3" dir="rtl" />
          <Label htmlFor="mission-ar">{t("missionField")}</Label>
          <Textarea id="mission-ar" defaultValue={aboutAr.mission ?? ""} className="mb-3" dir="rtl" />
          <Label htmlFor="ceo-ar">{t("ceoMessageField")}</Label>
          <Textarea id="ceo-ar" defaultValue={aboutAr.ceo_message ?? ""} dir="rtl" />
        </Card>
      </div>
      <form
        action={async () => {
          "use server";
          await saveModuleAction("about", { saved: true });
        }}
      >
        <Button type="submit" variant="accent">
          {t("save")}
        </Button>
      </form>
      <Card>
        <h2 className="mb-3 font-semibold">
          {t("valuesCount")} ({about.values.length})
        </h2>
        <ul className="space-y-2 text-sm">
          {about.values.map((v) => (
            <li key={v.id} className="rounded-lg border border-[var(--border)] px-3 py-2">
              {v.title} — {v.description}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
