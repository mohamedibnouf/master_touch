type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const isProd = process.env.NODE_ENV === "production";

const SENSITIVE_KEY =
  /pass(word)?|secret|token|authorization|cookie|service[_-]?role|private[_-]?key/i;

function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;
  const out: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEY.test(key)) {
      out[key] = "[redacted]";
      continue;
    }
    if (key === "error") {
      out.error = safeError(value);
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function safeError(err: unknown): { name?: string; message: string; code?: string } {
  if (err && typeof err === "object" && "code" in err && "message" in err) {
    const e = err as { name?: string; message: string; code?: string };
    return { name: e.name, message: e.message, code: e.code };
  }
  if (err instanceof Error) {
    return { name: err.name, message: err.message };
  }
  return { message: String(err) };
}

function write(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    service: "master-touch",
    env: process.env.NODE_ENV ?? "development",
    ...sanitizeContext(context),
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

  if (level === "error" && process.env.SENTRY_DSN) {
    void import("@/infrastructure/monitoring/sentry")
      .then((m) => m.captureException(safeError(context?.error ?? message), sanitizeContext(context)))
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
