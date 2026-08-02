import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/presentation/features/auth/AuthForms";
import type { Locale } from "@/lib/i18n/config";

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
    error === "forbidden" || error === "inactive" ? error : null;

  return (
    <div className="flex min-h-screen items-center px-4 pt-24 pb-16">
      <LoginForm nextPath={next} accessError={accessError} />
    </div>
  );
}
