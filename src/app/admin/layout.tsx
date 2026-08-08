import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { redirect } from "next/navigation";
import { AdminSidebar, AdminTopbar } from "@/presentation/components/layout/AdminChrome";
import { defaultLocale } from "@/lib/i18n/config";
import { requireAdminAccess } from "@/lib/permissions";
import { AuthorizationError, AuthenticationError } from "@/domain/shared/errors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdminAccess();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      redirect(`/${defaultLocale}/login?next=/admin`);
    }
    if (error instanceof AuthorizationError) {
      redirect(`/${defaultLocale}/login?error=forbidden`);
    }
    redirect(`/${defaultLocale}/login?error=config`);
  }

  const messages = (await import(`../../../messages/${defaultLocale}.json`)).default;

  return (
    <NextIntlClientProvider locale={defaultLocale} messages={messages}>
      <div className="flex min-h-screen bg-[var(--muted)]" dir="ltr">
        <AdminSidebar />
        <div className="admin-shell flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <div className="admin-content flex-1 p-3 sm:p-5 lg:p-6">{children}</div>
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
