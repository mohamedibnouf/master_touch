"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { loginAction, forgotPasswordAction, resetPasswordAction } from "@/actions/auth";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/primitives";
import { SuccessBanner } from "@/presentation/components/admin/AsyncStates";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean().optional(),
});

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  return (
    <form
      className="glass mx-auto w-full max-w-md space-y-4 rounded-2xl p-8"
      onSubmit={handleSubmit((values) => {
        setError(null);
        startTransition(async () => {
          const res = await loginAction({ ...values, locale, next: nextPath });
          if (res && "ok" in res && res.ok === false) setError(res.error);
        });
      })}
      noValidate
    >
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("login")}</h1>
      <div>
        <Label htmlFor="login-email">{t("email")}</Label>
        <Input id="login-email" type="email" autoComplete="email" {...register("email")} />
      </div>
      <div>
        <Label htmlFor="login-password">{t("password")}</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("remember")} />
        {t("rememberMe")}
      </label>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="accent" className="w-full" disabled={pending}>
        {pending ? common("loading") : t("login")}
      </Button>
      <Link href={`/${locale}/forgot-password`} className="block text-center text-sm text-[var(--accent)]">
        {t("forgotPassword")}
      </Link>
    </form>
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const locale = useLocale();
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<{ email: string }>();

  return (
    <form
      className="glass mx-auto w-full max-w-md space-y-4 rounded-2xl p-8"
      onSubmit={handleSubmit((values) => {
        startTransition(async () => {
          const res = await forgotPasswordAction(values.email, locale);
          if (res && "ok" in res && res.ok) setDone(true);
        });
      })}
      noValidate
    >
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("forgotPassword")}</h1>
      <div>
        <Label htmlFor="forgot-email">{t("email")}</Label>
        <Input id="forgot-email" type="email" autoComplete="email" {...register("email")} />
      </div>
      {done ? <SuccessBanner message={t("resetSent")} /> : null}
      <Button type="submit" variant="accent" className="w-full" disabled={pending}>
        {pending ? common("loading") : t("sendResetLink")}
      </Button>
      <Link href={`/${locale}/login`} className="block text-center text-sm text-[var(--accent)]">
        {t("backToLogin")}
      </Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const locale = useLocale();
  const [message, setMessage] = useState<"ok" | "mismatch" | null>(null);
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<{ password: string; confirm: string }>();

  return (
    <form
      className="glass mx-auto w-full max-w-md space-y-4 rounded-2xl p-8"
      onSubmit={handleSubmit((values) => {
        if (values.password !== values.confirm) {
          setMessage("mismatch");
          return;
        }
        startTransition(async () => {
          const res = await resetPasswordAction(values.password);
          if (res && "ok" in res && res.ok) setMessage("ok");
        });
      })}
      noValidate
    >
      <h1 className="font-display text-3xl text-[var(--primary)]">{t("resetPassword")}</h1>
      <div>
        <Label htmlFor="new-password">{t("newPassword")}</Label>
        <Input id="new-password" type="password" autoComplete="new-password" {...register("password")} />
      </div>
      <div>
        <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          {...register("confirm")}
        />
      </div>
      {message === "ok" ? <SuccessBanner message={common("success")} /> : null}
      {message === "mismatch" ? (
        <p className="text-sm text-red-600" role="alert">
          {common("passwordMismatch")}
        </p>
      ) : null}
      <Button type="submit" variant="accent" className="w-full" disabled={pending}>
        {pending ? common("loading") : t("updatePassword")}
      </Button>
      <Link href={`/${locale}/login`} className="block text-center text-sm text-[var(--accent)]">
        {t("backToLogin")}
      </Link>
    </form>
  );
}
