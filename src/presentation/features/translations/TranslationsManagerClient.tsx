"use client";

import { useTransition, useState } from "react";
import { saveTranslationAction } from "@/actions/cms";
import { Button } from "@/presentation/components/ui/button";
import { Card } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";

export type TranslationEditorRow = {
  id: string;
  key: string;
  locale: "ar" | "en";
  value: string;
  namespace: string;
};

export function TranslationsManagerClient({ rows }: { rows: TranslationEditorRow[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((r) => [r.id, r.value])),
  );

  const grouped = rows.reduce<Record<string, TranslationEditorRow[]>>((acc, row) => {
    const k = `${row.namespace}.${row.key}`;
    (acc[k] ??= []).push(row);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
      {Object.entries(grouped).map(([compound, group]) => (
        <Card key={compound} className="space-y-3">
          <p className="text-sm font-semibold">{compound}</p>
          {group.map((row) => (
            <div key={row.id} className="grid gap-2 md:grid-cols-[80px_1fr_auto]">
              <span className="text-xs uppercase text-[var(--muted-foreground)]">{row.locale}</span>
              <Input
                value={values[row.id] ?? ""}
                dir={row.locale === "ar" ? "rtl" : "ltr"}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValues((prev) => ({ ...prev, [row.id]: e.target.value }))
                }
              />
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await saveTranslationAction({
                      namespaceSlug: row.namespace,
                      key: row.key,
                      locale: row.locale,
                      value: values[row.id] ?? "",
                    });
                    setMessage(res.ok ? `Saved ${compound} (${row.locale})` : res.error);
                  })
                }
              >
                Save
              </Button>
            </div>
          ))}
        </Card>
      ))}
      {!rows.length ? <p className="text-sm text-[var(--muted-foreground)]">No translation rows in database.</p> : null}
    </div>
  );
}
