/** Shared media upload constraints (must match public-assets bucket limits). */
export const MEDIA_MAX_BYTES = 10 * 1024 * 1024; // 10MB

export const MEDIA_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

export function assertValidMediaFile(file: File): void {
  if (!file.size) {
    throw new Error("Empty file");
  }
  if (file.size > MEDIA_MAX_BYTES) {
    throw new Error(`File exceeds ${MEDIA_MAX_BYTES / (1024 * 1024)}MB limit`);
  }
  const mime = (file.type || "").toLowerCase();
  if (!mime || !MEDIA_ALLOWED_MIME.has(mime)) {
    throw new Error("Unsupported file type");
  }
}

export function sanitizeStorageFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return base || "upload.bin";
}
