import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/presentation/features/auth/AuthForms";
import type { Locale } from "@/lib/i18n/config";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale as Locale);

  return (
    <div className="flex min-h-screen items-center px-4 pt-24 pb-16">
      <LoginForm nextPath={next} />
    </div>
  );
}
