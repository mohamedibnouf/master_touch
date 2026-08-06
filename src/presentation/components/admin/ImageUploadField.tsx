"use client";

import { useId, useRef, useState, useTransition } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { uploadMediaAction } from "@/actions/media";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/primitives";
import { cn } from "@/lib/utils";

export function ImageUploadField({
  name,
  label,
  defaultValue,
  className,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  className?: string;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onPick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPG, WEBP, SVG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be 10MB or smaller.");
      return;
    }

    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("alt_text", file.name.replace(/\.[^.]+$/, ""));

    startTransition(async () => {
      const res = await uploadMediaAction(fd);
      if (!res.ok) {
        setError(res.error || "Upload failed");
        return;
      }
      if ("url" in res && res.url) {
        setUrl(res.url);
      }
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <input type="hidden" name={name} value={url} />

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]/40">
        <div className="relative flex aspect-[16/10] items-center justify-center bg-[var(--surface)]">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label || "Selected image"} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center text-[var(--muted-foreground)]">
              <ImageIcon className="h-8 w-8 opacity-50" aria-hidden />
              <p className="text-xs">No image selected</p>
            </div>
          )}
          {pending ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white">
              Uploading…
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--surface)] p-3">
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            disabled={pending}
            onChange={(e) => onPick(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="accent"
            size="sm"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            Upload from device
          </Button>
          {url ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => {
                setUrl("");
                setError(null);
              }}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {url ? (
        <p className="truncate text-[0.7rem] text-[var(--muted-foreground)]" title={url}>
          {url}
        </p>
      ) : null}
    </div>
  );
}
