"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, Label } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { updateOwnProfileAction } from "@/actions/admin-directory";
import { SuccessBanner, ConfirmDialog, ErrorState } from "@/presentation/components/admin/AsyncStates";

export function ProfileClient({ fullName, email }: { fullName: string; email: string }) {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      {saved ? <SuccessBanner message={common("saved")} /> : null}
      {error ? <ErrorState title={common("error")} description={error} /> : null}
      <Card className="max-w-lg space-y-3">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setError(null);
            setSaved(false);
            startTransition(async () => {
              const res = await updateOwnProfileAction(fd);
              if (res.ok) setSaved(true);
              else setError(res.error);
            });
          }}
        >
          <div>
            <Label htmlFor="full-name">{t("fullName")}</Label>
            <Input id="full-name" name="full_name" defaultValue={fullName} required minLength={2} maxLength={120} />
          </div>
          <div>
            <Label htmlFor="email">{common("email")}</Label>
            <Input id="email" defaultValue={email} disabled readOnly />
          </div>
          <Button type="submit" variant="accent" disabled={pending}>
            {pending ? common("loading") : t("updateProfile")}
          </Button>
        </form>
        <Button type="button" variant="outline" onClick={() => setConfirmLogout(true)}>
          {t("logout")}
        </Button>
      </Card>
      <ConfirmDialog
        open={confirmLogout}
        title={t("logout")}
        description={t("confirmDelete")}
        confirmLabel={common("confirm")}
        cancelLabel={t("cancel")}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          startTransition(async () => {
            await logoutAction();
          });
        }}
      />
    </>
  );
}
