import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-[var(--page-gutter)] pt-24 text-center">
      <p
        className="font-display text-[clamp(3.5rem,12vw,5.5rem)] font-semibold tracking-tight text-[var(--accent)]"
        aria-hidden
      >
        404
      </p>
      <h1 className="mt-4 font-display text-h2 font-semibold tracking-tight text-[var(--primary)]">
        {t("pageNotFound")}
      </h1>
      <Link
        href="/ar"
        className="mt-8 inline-flex min-h-11 items-center rounded-[var(--radius)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-cta)] transition hover:brightness-110 hover:shadow-[var(--shadow-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      >
        {t("goHome")}
      </Link>
    </div>
  );
}
