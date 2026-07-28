import { getTranslations } from "next-intl/server";
import { getContactContent } from "@/infrastructure/repositories/content.repository";
import { Card } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Label, Textarea } from "@/presentation/components/ui/primitives";
import { Button } from "@/presentation/components/ui/button";
import { saveModuleAction } from "@/actions/cms";
import { EmptyState } from "@/presentation/components/admin/AsyncStates";

export default async function AdminContactPage() {
  const contact = await getContactContent("en");
  const contactAr = await getContactContent("ar");
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("contact")}</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Label htmlFor="headline-en">{t("headlineEn")}</Label>
          <Input id="headline-en" defaultValue={contact.headline ?? ""} className="mb-3" />
          <Label htmlFor="intro-en">{t("introEn")}</Label>
          <Textarea id="intro-en" defaultValue={contact.intro ?? ""} className="mb-3" />
          <Label htmlFor="notify">{t("notifyEmail")}</Label>
          <Input id="notify" defaultValue={contact.notify_email ?? ""} />
        </Card>
        <Card>
          <Label htmlFor="headline-ar">{t("headlineAr")}</Label>
          <Input id="headline-ar" defaultValue={contactAr.headline ?? ""} className="mb-3" dir="rtl" />
          <Label htmlFor="intro-ar">{t("introAr")}</Label>
          <Textarea id="intro-ar" defaultValue={contactAr.intro ?? ""} dir="rtl" />
        </Card>
      </div>
      <Card>
        <h2 className="mb-3 font-semibold">{t("channels")}</h2>
        {!contact.channels.length ? <EmptyState title={t("noMessages")} /> : null}
        <ul className="space-y-2 text-sm">
          {contact.channels.map((c) => (
            <li
              key={c.id}
              className="flex justify-between rounded-lg border border-[var(--border)] px-3 py-2"
            >
              <span>{c.label}</span>
              <span dir="ltr">{c.value}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">{t("inbox")}</h2>
        <EmptyState title={t("noMessages")} description={t("messagesHint")} />
      </Card>
      <form
        action={async () => {
          "use server";
          await saveModuleAction("contact", { saved: true });
        }}
      >
        <Button type="submit" variant="accent">
          {t("save")}
        </Button>
      </form>
    </div>
  );
}
