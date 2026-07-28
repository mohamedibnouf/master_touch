import { setRequestLocale } from "next-intl/server";
import { ResetPasswordForm } from "@/presentation/features/auth/AuthForms";
import type { Locale } from "@/lib/i18n/config";

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <div className="flex min-h-screen items-center px-4 pt-24 pb-16">
      <ResetPasswordForm />
    </div>
  );
}
