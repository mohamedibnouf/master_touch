import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/presentation/features/auth/AuthForms";
import type { Locale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <div className="flex min-h-[calc(100svh-var(--header-height))] items-center px-[var(--page-gutter)] pt-24 pb-16">
      <ForgotPasswordForm />
    </div>
  );
}
