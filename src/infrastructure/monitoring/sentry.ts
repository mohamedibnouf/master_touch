import { logger } from "@/infrastructure/logging/logger";

/** Soft Sentry bridge — no-ops unless SENTRY_DSN is set and SDK initializes. */
export async function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error, { extra: context });
  } catch (err) {
    logger.warn("Sentry capture failed", { err });
  }
}

export async function captureMessage(message: string, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureMessage(message, { extra: context });
  } catch (err) {
    logger.warn("Sentry message failed", { err });
  }
}

/** OpenTelemetry placeholder — wire exporter when OTEL_EXPORTER_OTLP_ENDPOINT is set. */
export function startSpan(name: string): { end: (attrs?: Record<string, unknown>) => void } {
  const started = Date.now();
  return {
    end(attrs) {
      if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
        logger.performance(name, Date.now() - started, attrs);
      }
    },
  };
}
