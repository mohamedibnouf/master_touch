# Testing Guide

## Unit (Vitest)

```bash
npm run test:unit
```

Coverage focus:

- RBAC policy
- AppError mapping
- Zod + sanitization

Add new tests under `tests/unit/`.

## E2E (Playwright)

```bash
npx playwright install
npm run test:e2e
```

Smoke tests hit `/api/health`. Expand with auth + permission flows once staging credentials exist.

## CI

GitHub Actions (`.github/workflows/ci.yml`): install → lint → typecheck → unit → build → npm audit.
