"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/presentation/components/ui/button";
import { logger } from "@/infrastructure/logging/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    logger.error("route.error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-[var(--page-gutter)] pt-24 text-center">
      <h1 className="font-display text-h2 font-semibold tracking-tight text-[var(--primary)]">
        {t("error")}
      </h1>
      <Button variant="accent" onClick={reset}>
        {t("retry")}
      </Button>
    </div>
  );
}
