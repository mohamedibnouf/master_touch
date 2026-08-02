import { getTranslations } from "next-intl/server";
import { getAboutContent } from "@/infrastructure/repositories/content.repository";
import { Card, Label, Textarea } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { ImageUploadField } from "@/presentation/components/admin/ImageUploadField";
import { updateAboutAction } from "@/actions/cms";

export default async function AdminAboutPage() {
  const about = await getAboutContent("en");
  const aboutAr = await getAboutContent("ar");
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("about")}</h1>
      <form
        action={async (formData) => {
          "use server";
          await updateAboutAction(formData);
        }}
        className="space-y-4"
      >
        <input type="hidden" name="about_id" value={about.id} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-3 font-semibold">{t("english")}</h2>
            <Label htmlFor="history_en">{t("history")}</Label>
            <Textarea id="history_en" name="history_en" defaultValue={about.history ?? ""} className="mb-3" />
            <Label htmlFor="vision_en">{t("visionField")}</Label>
            <Textarea id="vision_en" name="vision_en" defaultValue={about.vision ?? ""} className="mb-3" />
            <Label htmlFor="mission_en">{t("missionField")}</Label>
            <Textarea id="mission_en" name="mission_en" defaultValue={about.mission ?? ""} className="mb-3" />
            <Label htmlFor="objectives_en">Objectives</Label>
            <Textarea id="objectives_en" name="objectives_en" defaultValue={about.objectives ?? ""} className="mb-3" />
            <Label htmlFor="ceo_message_en">{t("ceoMessageField")}</Label>
            <Textarea id="ceo_message_en" name="ceo_message_en" defaultValue={about.ceo_message ?? ""} className="mb-3" />
            <Label htmlFor="ceo_name_en">CEO name</Label>
            <Input id="ceo_name_en" name="ceo_name_en" defaultValue={about.ceo_name ?? ""} className="mb-3" />
            <Label htmlFor="ceo_title_en">CEO title</Label>
            <Input id="ceo_title_en" name="ceo_title_en" defaultValue={about.ceo_title ?? ""} />
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold">{t("arabic")}</h2>
            <Label htmlFor="history_ar">{t("history")}</Label>
            <Textarea id="history_ar" name="history_ar" defaultValue={aboutAr.history ?? ""} className="mb-3" dir="rtl" />
            <Label htmlFor="vision_ar">{t("visionField")}</Label>
            <Textarea id="vision_ar" name="vision_ar" defaultValue={aboutAr.vision ?? ""} className="mb-3" dir="rtl" />
            <Label htmlFor="mission_ar">{t("missionField")}</Label>
            <Textarea id="mission_ar" name="mission_ar" defaultValue={aboutAr.mission ?? ""} className="mb-3" dir="rtl" />
            <Label htmlFor="objectives_ar">Objectives</Label>
            <Textarea id="objectives_ar" name="objectives_ar" defaultValue={aboutAr.objectives ?? ""} className="mb-3" dir="rtl" />
            <Label htmlFor="ceo_message_ar">{t("ceoMessageField")}</Label>
            <Textarea id="ceo_message_ar" name="ceo_message_ar" defaultValue={aboutAr.ceo_message ?? ""} className="mb-3" dir="rtl" />
            <Label htmlFor="ceo_name_ar">CEO name</Label>
            <Input id="ceo_name_ar" name="ceo_name_ar" defaultValue={aboutAr.ceo_name ?? ""} className="mb-3" dir="rtl" />
            <Label htmlFor="ceo_title_ar">CEO title</Label>
            <Input id="ceo_title_ar" name="ceo_title_ar" defaultValue={aboutAr.ceo_title ?? ""} dir="rtl" />
          </Card>
        </div>
        <Card className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ImageUploadField
            name="cover_image_url"
            label="Cover image"
            defaultValue={about.cover_image_url}
          />
          <div>
            <Label htmlFor="video_url">Video URL</Label>
            <Input id="video_url" name="video_url" defaultValue={about.video_url ?? ""} />
          </div>
          <ImageUploadField
            name="ceo_image_url"
            label="CEO image"
            defaultValue={about.ceo_image_url}
          />
        </Card>
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
