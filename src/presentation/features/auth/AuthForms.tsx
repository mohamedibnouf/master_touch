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

const authLinkClass =
  "block text-center text-sm text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";

function AuthSuccess({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--muted)] px-4 py-3 text-sm font-medium text-[var(--primary)]"
    >
      {message}
    </div>
  );
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean().optional(),
});

export function LoginForm({
  nextPath,
  accessError,
}: {
  nextPath?: string;
  accessError?: "forbidden" | "inactive" | "auth_link_invalid" | null;
}) {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const locale = useLocale();
  const [error, setError] = useState<string | null>(() => {
    if (accessError === "forbidden") return t("forbidden");
    if (accessError === "inactive") return t("inactive");
    if (accessError === "auth_link_invalid") return t("authLinkInvalid");
    return null;
  });
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
  });

  return (
    <form
      className="mt-panel mx-auto w-full max-w-md space-y-5 rounded-[var(--radius)] p-6 shadow-[var(--shadow-soft)] sm:p-9"
      onSubmit={handleSubmit((values) => {
        setError(null);
        startTransition(async () => {
          const res = await loginAction({ ...values, locale, next: nextPath });
          if (res && "ok" in res && res.ok === false) setError(res.error);
        });
      })}
      noValidate
    >
      <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--primary)]">{t("login")}</h1>
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
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="h-5 w-5 shrink-0 rounded-[var(--radius)] border border-[var(--line)] accent-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          {...register("remember")}
        />
        {t("rememberMe")}
      </label>
      {error ? (
        <p className="text-sm text-[var(--warning)]" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="accent" className="w-full" disabled={pending}>
        {pending ? common("loading") : t("login")}
      </Button>
      <Link href={`/${locale}/forgot-password`} className={authLinkClass}>
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
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<{ email: string }>();

  return (
    <form
      className="mt-panel mx-auto w-full max-w-md space-y-5 rounded-[var(--radius)] p-6 shadow-[var(--shadow-soft)] sm:p-9"
      onSubmit={handleSubmit((values) => {
        setError(null);
        setDone(false);
        startTransition(async () => {
          const res = await forgotPasswordAction(values.email, locale);
          if (res && "ok" in res && res.ok) setDone(true);
          else if (res && "ok" in res && res.ok === false) setError(res.error);
        });
      })}
      noValidate
    >
      <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--primary)]">{t("forgotPassword")}</h1>
      <div>
        <Label htmlFor="forgot-email">{t("email")}</Label>
        <Input id="forgot-email" type="email" autoComplete="email" {...register("email")} />
      </div>
      {done ? <AuthSuccess message={t("resetSent")} /> : null}
      {error ? (
        <p className="text-sm text-[var(--warning)]" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="accent" className="w-full" disabled={pending}>
        {pending ? common("loading") : t("sendResetLink")}
      </Button>
      <Link href={`/${locale}/login`} className={authLinkClass}>
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
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<{ password: string; confirm: string }>();

  return (
    <form
      className="mt-panel mx-auto w-full max-w-md space-y-5 rounded-[var(--radius)] p-6 shadow-[var(--shadow-soft)] sm:p-9"
      onSubmit={handleSubmit((values) => {
        if (values.password !== values.confirm) {
          setMessage("mismatch");
          setError(null);
          return;
        }
        setMessage(null);
        setError(null);
        startTransition(async () => {
          const res = await resetPasswordAction(values.password);
          if (res && "ok" in res && res.ok) setMessage("ok");
          else if (res && "ok" in res && res.ok === false) setError(res.error);
        });
      })}
      noValidate
    >
      <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--primary)]">{t("resetPassword")}</h1>
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
      {message === "ok" ? <AuthSuccess message={common("success")} /> : null}
      {message === "mismatch" ? (
        <p className="text-sm text-[var(--warning)]" role="alert">
          {common("passwordMismatch")}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-[var(--warning)]" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="accent" className="w-full" disabled={pending}>
        {pending ? common("loading") : t("updatePassword")}
      </Button>
      <Link href={`/${locale}/login`} className={authLinkClass}>
        {t("backToLogin")}
      </Link>
    </form>
  );
}
