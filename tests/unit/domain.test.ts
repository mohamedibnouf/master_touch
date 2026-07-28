import { describe, expect, it } from "vitest";
import { rbacPolicy } from "@/domain/rbac/policy";
import {
  ValidationError,
  AuthorizationError,
  isAppError,
  toActionError,
} from "@/domain/shared/errors";
import { contactMessageSchema, sanitizePlainText } from "@/lib/validations";

describe("rbacPolicy", () => {
  it("allows wildcard", () => {
    expect(rbacPolicy.can(["*"], "theme.manage")).toBe(true);
  });

  it("allows module manage to cover actions", () => {
    expect(rbacPolicy.can(["homepage.manage"], "homepage.update")).toBe(true);
  });

  it("denies missing permission", () => {
    expect(rbacPolicy.can(["homepage.view"], "homepage.update")).toBe(false);
  });
});

describe("errors", () => {
  it("maps ValidationError", () => {
    const err = toActionError(new ValidationError("bad"));
    expect(err.status).toBe(400);
    expect(err.code).toBe("VALIDATION");
  });

  it("detects AppError", () => {
    expect(isAppError(new AuthorizationError())).toBe(true);
  });
});

describe("validation", () => {
  it("accepts valid contact payload", () => {
    const parsed = contactMessageSchema.safeParse({
      name: "Ali",
      email: "ali@example.com",
      message: "Hello there, I need a quote.",
    });
    expect(parsed.success).toBe(true);
  });

  it("sanitizes angle brackets", () => {
    expect(sanitizePlainText("<script>x</script>")).toBe("scriptx/script");
  });
});
