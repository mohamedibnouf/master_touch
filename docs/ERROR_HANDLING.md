# Error Handling

## Hierarchy

Located in `src/domain/shared/errors.ts`:

- `AppError`
- `ValidationError` (400)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `NotFoundError` (404)
- `RateLimitError` (429)
- `DatabaseError` (500)
- `ExternalServiceError` (502)
- `ConfigurationError` (503)

## Server Actions

Use `toActionError(error)` to return `{ ok: false, error, code, status }`.
Next.js `redirect()` errors must be rethrown (digest check).

## UI

- `src/app/[locale]/error.tsx` — route error boundary  
- `src/app/global-error.tsx` — root critical errors  
- Admin shared `ErrorState` component  

## Logging

`logger.error` emits JSON; when `SENTRY_DSN` is set, errors forward to Sentry.
