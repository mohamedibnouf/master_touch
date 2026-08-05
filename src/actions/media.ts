"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { requirePermission, writeAuditLog } from "@/lib/permissions";
import { DatabaseError, toActionError, ValidationError } from "@/domain/shared/errors";
import { assertValidMediaFile, sanitizeStorageFileName } from "@/lib/media/constraints";
import { z } from "zod";

export async function listMediaAssets(folderId?: string | null) {
  try {
    await requirePermission("media.view");
    const admin = createAdminClient();
    let query = admin
      .from("media_assets")
      .select(
        "id, file_name, public_url, mime_type, media_type, alt_text, size_bytes, storage_path, folder_id, created_at",
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(200);
    if (folderId) query = query.eq("folder_id", folderId);
    const { data, error } = await query;
    if (error) throw new DatabaseError(error.message, error);
    return { ok: true as const, data: data ?? [] };
  } catch (error) {
    return { ...toActionError(error), data: [] as const };
  }
}

export async function listMediaFoldersAction() {
  try {
    await requirePermission("media.view");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("media_folders")
      .select("id, name, slug, parent_id")
      .is("deleted_at", null)
      .order("name")
      .limit(200);
    if (error) throw new DatabaseError(error.message, error);
    return { ok: true as const, data: data ?? [] };
  } catch (error) {
    return { ...toActionError(error), data: [] as const };
  }
}

export async function createMediaFolderAction(formData: FormData) {
  try {
    await requirePermission("media.create");
    const name = String(formData.get("name") ?? "").trim();
    if (!name) throw new ValidationError("name required");
    const slug =
      String(formData.get("slug") ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-") || name.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const parentRaw = String(formData.get("parent_id") ?? "").trim();
    const parentId = parentRaw || null;
    if (parentId) {
      const uuid = z.string().uuid().safeParse(parentId);
      if (!uuid.success) throw new ValidationError("Invalid parent_id");
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("media_folders")
      .insert({ name, slug, parent_id: parentId })
      .select("id")
      .single();
    if (error) throw new DatabaseError(error.message, error);
    await writeAuditLog("media.folder.create", "media_folders", data.id);
    revalidatePath("/admin/media");
    return { ok: true as const, id: data.id };
  } catch (error) {
    return toActionError(error);
  }
}

export async function uploadMediaAction(formData: FormData) {
  try {
    await requirePermission("media.create");
    const file = formData.get("file");
    if (!(file instanceof File)) throw new ValidationError("File required");
    try {
      assertValidMediaFile(file);
    } catch (e) {
      throw new ValidationError(e instanceof Error ? e.message : "Invalid file");
    }

    const schema = z.object({
      alt_text: z.string().max(200).optional(),
      folder_id: z.string().uuid().optional().or(z.literal("")),
    });
    const meta = schema.parse({
      alt_text: String(formData.get("alt_text") ?? ""),
      folder_id: String(formData.get("folder_id") ?? ""),
    });

    const admin = createAdminClient();
    const path = `uploads/${Date.now()}-${sanitizeStorageFileName(file.name)}`;
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
        file_name: file.name.slice(0, 255),
        storage_path: path,
        public_url: pub.publicUrl,
        mime_type: file.type,
        media_type: file.type.startsWith("image/") ? "image" : "other",
        size_bytes: file.size,
        alt_text: meta.alt_text || null,
        folder_id: meta.folder_id || null,
      })
      .select("id")
      .single();

    if (error) {
      await admin.storage.from("public-assets").remove([path]);
      throw new DatabaseError(error.message, error);
    }
    await writeAuditLog("media.upload", "media_assets", data.id);
    revalidatePath("/admin/media");
    return { ok: true as const, id: data.id, url: pub.publicUrl };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateMediaAction(formData: FormData) {
  try {
    await requirePermission("media.update");
    const id = String(formData.get("id") ?? "");
    if (!id) throw new ValidationError("id required");
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) throw new ValidationError("Invalid id");

    const admin = createAdminClient();
    const folderRaw = String(formData.get("folder_id") ?? "").trim();
    if (folderRaw) {
      const folderOk = z.string().uuid().safeParse(folderRaw);
      if (!folderOk.success) throw new ValidationError("Invalid folder_id");
    }
    const { error } = await admin
      .from("media_assets")
      .update({
        alt_text: String(formData.get("alt_text") ?? "") || null,
        folder_id: folderRaw || null,
      })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw new DatabaseError(error.message, error);
    await writeAuditLog("media.update", "media_assets", id);
    revalidatePath("/admin/media");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}

export async function replaceMediaAction(formData: FormData) {
  try {
    await requirePermission("media.update");
    const id = String(formData.get("id") ?? "");
    const file = formData.get("file");
    if (!id) throw new ValidationError("id required");
    if (!(file instanceof File)) throw new ValidationError("File required");
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) throw new ValidationError("Invalid id");
    try {
      assertValidMediaFile(file);
    } catch (e) {
      throw new ValidationError(e instanceof Error ? e.message : "Invalid file");
    }

    const admin = createAdminClient();
    const { data: existing, error: readError } = await admin
      .from("media_assets")
      .select("storage_path")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (readError) throw new DatabaseError(readError.message, readError);
    if (!existing) throw new DatabaseError("Asset not found");

    const path = `uploads/${Date.now()}-${sanitizeStorageFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage.from("public-assets").upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw new DatabaseError(uploadError.message, uploadError);
    const { data: pub } = admin.storage.from("public-assets").getPublicUrl(path);

    const { error } = await admin
      .from("media_assets")
      .update({
        file_name: file.name.slice(0, 255),
        storage_path: path,
        public_url: pub.publicUrl,
        mime_type: file.type,
        media_type: file.type.startsWith("image/") ? "image" : "other",
        size_bytes: file.size,
      })
      .eq("id", id);
    if (error) {
      await admin.storage.from("public-assets").remove([path]);
      throw new DatabaseError(error.message, error);
    }

    if (existing.storage_path && existing.storage_path !== path) {
      await admin.storage.from("public-assets").remove([existing.storage_path]);
    }

    await writeAuditLog("media.replace", "media_assets", id);
    revalidatePath("/admin/media");
    return { ok: true as const, url: pub.publicUrl };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteMediaAction(id: string) {
  try {
    await requirePermission("media.delete");
    const idParsed = z.string().uuid().safeParse(id);
    if (!idParsed.success) throw new ValidationError("Invalid id");

    const admin = createAdminClient();
    const { data: existing, error: readError } = await admin
      .from("media_assets")
      .select("storage_path")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (readError) throw new DatabaseError(readError.message, readError);
    if (!existing) throw new DatabaseError("Asset not found");

    const { error } = await admin
      .from("media_assets")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new DatabaseError(error.message, error);

    if (existing.storage_path) {
      await admin.storage.from("public-assets").remove([existing.storage_path]);
    }

    await writeAuditLog("media.delete", "media_assets", id);
    revalidatePath("/admin/media");
    return { ok: true as const };
  } catch (error) {
    return toActionError(error);
  }
}
