type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const isProd = process.env.NODE_ENV === "production";

function write(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    service: "master-touch",
    env: process.env.NODE_ENV ?? "development",
    ...context,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else if (level === "debug" && isProd) {
    return;
  } else {
    console.info(line);
  }

  // Hook: forward to Sentry / OTel when configured
  if (level === "error" && process.env.SENTRY_DSN) {
    void import("@/infrastructure/monitoring/sentry")
      .then((m) => m.captureException(context?.error ?? message, context))
      .catch(() => undefined);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => write("debug", message, context),
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context),
  audit: (action: string, context?: LogContext) =>
    write("info", action, { channel: "audit", ...context }),
  performance: (label: string, durationMs: number, context?: LogContext) =>
    write("info", label, { channel: "performance", durationMs, ...context }),
};
