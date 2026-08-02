"use client";

import { useEffect } from "react";
import { isAppError } from "@/domain/shared/errors";
import { logger } from "@/infrastructure/logging/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("global.error", { error, digest: error.digest });
  }, [error]);

  const message = isAppError(error) ? error.message : "A critical error occurred.";

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", padding: 40 }}>
        <h1>Something went wrong</h1>
        <p>{message}</p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  );
}
