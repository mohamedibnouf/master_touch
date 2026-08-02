"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createMediaFolderAction,
  deleteMediaAction,
  listMediaAssets,
  listMediaFoldersAction,
  replaceMediaAction,
  updateMediaAction,
  uploadMediaAction,
} from "@/actions/media";
import { Button } from "@/presentation/components/ui/button";
import { Card, Label } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";

type Asset = {
  id: string;
  file_name: string;
  public_url: string | null;
  alt_text: string | null;
  folder_id: string | null;
};

type Folder = { id: string; name: string; slug: string; parent_id: string | null };

export function MediaLibraryClient() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function refresh() {
    const [a, f] = await Promise.all([listMediaAssets(), listMediaFoldersAction()]);
    if (a.ok) setAssets(a.data as Asset[]);
    if (f.ok) setFolders(f.data as Folder[]);
  }

  useEffect(() => {
    startTransition(() => {
      void refresh();
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">Media</h1>
      {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Upload</h2>
          <form
            action={(fd) => {
              startTransition(async () => {
                const res = await uploadMediaAction(fd);
                setMessage(res.ok ? "Uploaded" : res.error);
                await refresh();
              });
            }}
            className="space-y-3"
          >
            <Input name="file" type="file" accept="image/*,video/*,.pdf" required />
            <Input name="alt_text" placeholder="Alt text" />
            <select name="folder_id" className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
              <option value="">No folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <Button type="submit" variant="accent" disabled={pending}>
              Upload
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Folders</h2>
          <form
            action={(fd) => {
              startTransition(async () => {
                const res = await createMediaFolderAction(fd);
                setMessage(res.ok ? "Folder created" : res.error);
                await refresh();
              });
            }}
            className="mb-3 flex gap-2"
          >
            <Input name="name" placeholder="Folder name" required />
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
          <ul className="space-y-1 text-sm">
            {folders.map((f) => (
              <li key={f.id}>{f.name}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <Card key={asset.id} className="space-y-2">
            {asset.public_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.public_url} alt={asset.alt_text ?? asset.file_name} className="h-36 w-full object-cover" />
            ) : null}
            <p className="truncate text-sm font-medium">{asset.file_name}</p>
            <form
              action={(fd) => {
                startTransition(async () => {
                  fd.set("id", asset.id);
                  const res = await updateMediaAction(fd);
                  setMessage(res.ok ? "Updated" : res.error);
                  await refresh();
                });
              }}
              className="space-y-2"
            >
              <Label htmlFor={`alt-${asset.id}`}>Alt text</Label>
              <Input id={`alt-${asset.id}`} name="alt_text" defaultValue={asset.alt_text ?? ""} />
              <Button type="submit" size="sm" variant="secondary">
                Save meta
              </Button>
            </form>
            <form
              action={(fd) => {
                startTransition(async () => {
                  fd.set("id", asset.id);
                  const res = await replaceMediaAction(fd);
                  setMessage(res.ok ? "Replaced" : res.error);
                  await refresh();
                });
              }}
              className="space-y-2"
            >
              <Input name="file" type="file" required />
              <Button type="submit" size="sm">
                Replace
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteMediaAction(asset.id);
                  setMessage(res.ok ? "Deleted" : res.error);
                  await refresh();
                })
              }
            >
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
