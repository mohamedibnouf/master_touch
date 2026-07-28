import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("health endpoint responds", async ({ request }) => {
    const res = await request.get("/api/health");
    // 200 when configured, 503 when env missing — both prove the route works
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty("checks");
  });
});
