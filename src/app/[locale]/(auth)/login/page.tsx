import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/presentation/features/auth/AuthForms";
import type { Locale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { next, error } = await searchParams;
  setRequestLocale(locale as Locale);

  const accessError =
    error === "forbidden" || error === "inactive" || error === "auth_link_invalid"
      ? error
      : null;

  return (
    <div className="flex min-h-[calc(100svh-var(--header-height))] items-center px-[var(--page-gutter)] pt-24 pb-16">
      <LoginForm nextPath={next} accessError={accessError} />
    </div>
  );
}
