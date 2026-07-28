"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { requirePermission, writeAuditLog } from "@/lib/permissions";
import { DatabaseError, toActionError, ValidationError } from "@/domain/shared/errors";
import { z } from "zod";

export async function listMediaAssets() {
  try {
    await requirePermission("media.view");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("media_assets")
      .select("id, file_name, public_url, mime_type, alt_text, size_bytes, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new DatabaseError(error.message, error);
    return { ok: true as const, data: data ?? [] };
  } catch (error) {
    return { ...toActionError(error), data: [] as const };
  }
}

export async function uploadMediaAction(formData: FormData) {
  try {
    await requirePermission("media.create");
    const file = formData.get("file");
    if (!(file instanceof File)) throw new ValidationError("File required");

    const schema = z.object({
      alt_text: z.string().max(200).optional(),
    });
    const meta = schema.parse({ alt_text: String(formData.get("alt_text") ?? "") });

    const admin = createAdminClient();
    const path = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage.from("public-assets").upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw new DatabaseError(uploadError.message, uploadError);

    const { data: pub } = admin.storage.from("public-assets").getPublicUrl(path);

    const { data, error } = await admin
      .from("media_assets")
      .insert({
        file_name: file.name,
        storage_path: path,
        public_url: pub.publicUrl,
        mime_type: file.type,
        media_type: file.type.startsWith("image/") ? "image" : "other",
        size_bytes: file.size,
        alt_text: meta.alt_text || null,
      })
      .select("id")
      .single();

    if (error) throw new DatabaseError(error.message, error);
    await writeAuditLog("media.upload", "media_assets", data.id);
    return { ok: true as const, id: data.id, url: pub.publicUrl };
  } catch (error) {
    return toActionError(error);
  }
}
