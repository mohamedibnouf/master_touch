"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Card, Label } from "@/presentation/components/ui/primitives";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { SuccessBanner, ConfirmDialog } from "@/presentation/components/admin/AsyncStates";

export default function AdminProfilePage() {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const [saved, setSaved] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("profile")}</h1>
      {saved ? <SuccessBanner message={common("saved")} /> : null}
      <Card className="max-w-lg space-y-3">
        <div>
          <Label htmlFor="full-name">{t("fullName")}</Label>
          <Input id="full-name" defaultValue="Super Admin" />
        </div>
        <div>
          <Label htmlFor="email">{common("email")}</Label>
          <Input id="email" defaultValue="admin@mastertouchksa.com" />
        </div>
        <Button
          variant="accent"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              setSaved(true);
            });
          }}
        >
          {t("updateProfile")}
        </Button>
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
    </div>
  );
}
