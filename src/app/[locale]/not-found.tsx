import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 pt-24 text-center">
      <p className="font-display text-7xl text-[var(--accent)]" aria-hidden>
        404
      </p>
      <h1 className="mt-4 font-display text-3xl text-[var(--primary)]">{t("pageNotFound")}</h1>
      <Link
        href="/ar"
        className="mt-8 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {t("goHome")}
      </Link>
    </div>
  );
}
