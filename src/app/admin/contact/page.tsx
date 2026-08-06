import { getTranslations } from "next-intl/server";
import { getContactContent } from "@/infrastructure/repositories/content.repository";
import { Card, Label, Textarea } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import {
  listContactMessagesAction,
  updateContactMessageStatusAction,
  updateContactSettingsAction,
} from "@/actions/cms";

export default async function AdminContactPage() {
  const en = await getContactContent("en");
  const ar = await getContactContent("ar");
  const t = await getTranslations("admin");
  const messages = await listContactMessagesAction();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("contact")}</h1>
      <form
        action={async (formData) => {
          "use server";
          await updateContactSettingsAction(formData);
        }}
        className="space-y-4"
      >
        <input type="hidden" name="settings_id" value={en.id} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-3 font-semibold">{t("english")}</h2>
            <Label htmlFor="headline_en">Headline</Label>
            <Input id="headline_en" name="headline_en" defaultValue={en.headline ?? ""} className="mb-3" />
            <Label htmlFor="intro_en">Intro</Label>
            <Textarea id="intro_en" name="intro_en" defaultValue={en.intro ?? ""} className="mb-3" />
            <Label htmlFor="form_success_en">Form success</Label>
            <Textarea id="form_success_en" name="form_success_en" defaultValue={en.form_success_message ?? ""} />
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold">{t("arabic")}</h2>
            <Label htmlFor="headline_ar">Headline</Label>
            <Input id="headline_ar" name="headline_ar" defaultValue={ar.headline ?? ""} className="mb-3" dir="rtl" />
            <Label htmlFor="intro_ar">Intro</Label>
            <Textarea id="intro_ar" name="intro_ar" defaultValue={ar.intro ?? ""} className="mb-3" dir="rtl" />
            <Label htmlFor="form_success_ar">Form success</Label>
            <Textarea
              id="form_success_ar"
              name="form_success_ar"
              defaultValue={ar.form_success_message ?? ""}
              dir="rtl"
            />
          </Card>
        </div>
        <Card className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="notify_email">Notify email</Label>
            <Input id="notify_email" name="notify_email" type="email" defaultValue={en.notify_email ?? ""} />
          </div>
          <div>
            <Label htmlFor="map_embed_url">Map embed URL</Label>
            <Input id="map_embed_url" name="map_embed_url" defaultValue={en.map_embed_url ?? ""} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_form_enabled"
              value="on"
              defaultChecked={en.is_form_enabled}
            />
            Form enabled
          </label>
        </Card>
        <Button type="submit" variant="accent">
          {t("save")}
        </Button>
      </form>

      <Card>
        <h2 className="mb-3 font-semibold">Inbox ({messages.data.length})</h2>
        <ul className="space-y-3">
          {messages.data.map((m) => (
            <li key={m.id} className="rounded-lg border border-[var(--border)] p-3 text-sm">
              <div className="font-medium">
                {m.name} · {m.email} · {m.status}
              </div>
              <p className="mt-1 text-[var(--muted-foreground)]">{m.message}</p>
              <form
                action={async () => {
                  "use server";
                  await updateContactMessageStatusAction(m.id, "read");
                }}
                className="mt-2"
              >
                <Button type="submit" size="sm" variant="secondary">
                  Mark read
                </Button>
              </form>
            </li>
          ))}
          {!messages.data.length ? <p className="text-sm text-[var(--muted-foreground)]">No messages.</p> : null}
        </ul>
      </Card>
    </div>
  );
}
