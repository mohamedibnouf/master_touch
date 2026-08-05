import { getTranslations } from "next-intl/server";
import { getAdminServicesDetailed } from "@/infrastructure/repositories/content.repository";
import { Card, Label, Textarea } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { ImageUploadField } from "@/presentation/components/admin/ImageUploadField";
import { IconSelect } from "@/presentation/components/admin/IconSelect";
import { createServiceAction, deleteServiceAction, updateServiceAction } from "@/actions/cms";

export default async function AdminServicesPage() {
  const t = await getTranslations("admin");
  const services = await getAdminServicesDetailed();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("services")}</h1>

      <Card>
        <h2 className="mb-3 font-semibold">Create service</h2>
        <form
          action={async (formData) => {
            "use server";
            await createServiceAction(formData);
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" required placeholder="electromechanical" />
          </div>
          <div>
            <Label htmlFor="sort_order">Sort order</Label>
            <Input id="sort_order" name="sort_order" type="number" defaultValue={0} />
          </div>
          <div>
            <Label htmlFor="title_en">Title EN</Label>
            <Input id="title_en" name="title_en" required />
          </div>
          <div>
            <Label htmlFor="title_ar">Title AR</Label>
            <Input id="title_ar" name="title_ar" required dir="rtl" />
          </div>
          <div>
            <Label htmlFor="summary_en">Summary EN</Label>
            <Textarea id="summary_en" name="summary_en" />
          </div>
          <div>
            <Label htmlFor="summary_ar">Summary AR</Label>
            <Textarea id="summary_ar" name="summary_ar" dir="rtl" />
          </div>
          <ImageUploadField name="cover_image_url" label="Cover image" className="md:col-span-2" />
          <IconSelect name="icon" label="Icon" className="md:col-span-2" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" defaultChecked /> Published
          </label>
          <Button type="submit" variant="accent">
            Create
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {services.length === 0 ? (
          <Card>
            <p className="text-sm text-[var(--muted-foreground)]">No services yet.</p>
          </Card>
        ) : null}
        {services.map((service) => {
          const tr = service.translations;
          return (
            <Card key={service.id}>
              <form
                action={async (formData) => {
                  "use server";
                  await updateServiceAction(formData);
                }}
                className="grid gap-3 md:grid-cols-2"
              >
                <input type="hidden" name="id" value={service.id} />
                <div>
                  <Label>Slug</Label>
                  <Input name="slug" defaultValue={service.slug} required />
                </div>
                <div>
                  <Label>Sort</Label>
                  <Input name="sort_order" type="number" defaultValue={service.sort_order} />
                </div>
                <div>
                  <Label>Title EN</Label>
                  <Input name="title_en" defaultValue={tr.en?.title ?? service.title} required />
                </div>
                <div>
                  <Label>Title AR</Label>
                  <Input name="title_ar" defaultValue={tr.ar?.title ?? ""} dir="rtl" required />
                </div>
                <div>
                  <Label>Summary EN</Label>
                  <Textarea name="summary_en" defaultValue={tr.en?.summary ?? service.summary ?? ""} />
                </div>
                <div>
                  <Label>Summary AR</Label>
                  <Textarea name="summary_ar" defaultValue={tr.ar?.summary ?? ""} dir="rtl" />
                </div>
                <div>
                  <Label>Description EN</Label>
                  <Textarea name="description_en" defaultValue={tr.en?.description ?? ""} />
                </div>
                <div>
                  <Label>Description AR</Label>
                  <Textarea name="description_ar" defaultValue={tr.ar?.description ?? ""} dir="rtl" />
                </div>
                <ImageUploadField
                  name="cover_image_url"
                  label="Cover image"
                  defaultValue={service.cover_image_url}
                  className="md:col-span-2"
                />
                <IconSelect
                  name="icon"
                  label="Icon"
                  defaultValue={service.icon}
                  className="md:col-span-2"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_featured" defaultChecked={service.is_featured} /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_published" defaultChecked={service.is_published} /> Published
                </label>
                <div className="flex gap-2 md:col-span-2">
                  <Button type="submit" variant="accent">
                    Save
                  </Button>
                </div>
              </form>
              <form
                action={async () => {
                  "use server";
                  await deleteServiceAction(service.id);
                }}
                className="mt-2"
              >
                <Button type="submit" variant="ghost" size="sm">
                  Soft delete
                </Button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
