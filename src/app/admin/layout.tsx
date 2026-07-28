import { NextIntlClientProvider } from "next-intl";
import { AdminSidebar, AdminTopbar } from "@/presentation/components/layout/AdminChrome";
import { defaultLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const messages = (await import(`../../../messages/${defaultLocale}.json`)).default;

  return (
    <NextIntlClientProvider locale={defaultLocale} messages={messages}>
      <div className="flex min-h-screen bg-[var(--muted)] dark:bg-[var(--background)]" dir="ltr">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
