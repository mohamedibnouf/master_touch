/**
 * Domain error hierarchy for Master Touch CMS.
 */

export type ErrorCode =
  | "APP_ERROR"
  | "VALIDATION"
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "DATABASE"
  | "EXTERNAL_SERVICE"
  | "CONFIGURATION"
  | "RATE_LIMIT"
  | "NOT_FOUND";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;
  readonly cause?: unknown;

  constructor(
    message: string,
    options?: {
      code?: ErrorCode;
      status?: number;
      details?: unknown;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "AppError";
    this.code = options?.code ?? "APP_ERROR";
    this.status = options?.status ?? 500;
    this.details = options?.details;
    this.cause = options?.cause;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      status: this.status,
      message: this.message,
      details: this.details,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, { code: "VALIDATION", status: 400, details });
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, { code: "AUTHENTICATION", status: 401 });
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, { code: "AUTHORIZATION", status: 403 });
    this.name = "AuthorizationError";
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error", cause?: unknown) {
    super(message, { code: "DATABASE", status: 500, cause });
    this.name = "DatabaseError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service error", cause?: unknown) {
    super(message, { code: "EXTERNAL_SERVICE", status: 502, cause });
    this.name = "ExternalServiceError";
  }
}

export class ConfigurationError extends AppError {
  constructor(message = "Application is not configured") {
    super(message, { code: "CONFIGURATION", status: 503 });
    this.name = "ConfigurationError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", retryAfterMs?: number) {
    super(message, { code: "RATE_LIMIT", status: 429, details: { retryAfterMs } });
    this.name = "RateLimitError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, { code: "NOT_FOUND", status: 404 });
    this.name = "NotFoundError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toActionError(error: unknown): { ok: false; error: string; code: ErrorCode; status: number } {
  if (isAppError(error)) {
    return { ok: false, error: error.message, code: error.code, status: error.status };
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message, code: "APP_ERROR", status: 500 };
  }
  return { ok: false, error: "Unknown error", code: "APP_ERROR", status: 500 };
}
