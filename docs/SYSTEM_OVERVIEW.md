# System Overview — Master Touch (Phase 1.5)

Enterprise multilingual CMS for Master Touch (ماستر تاتش).

## Runtime dependencies (mandatory)

1. **Supabase** — Auth, PostgreSQL, Storage, RLS  
2. **Upstash Redis** — distributed rate limiting  

Optional: Sentry DSN, OpenTelemetry endpoint.

## Request flow

```text
Browser → Middleware (locale / admin session)
       → Server Components / Server Actions
       → requirePermission / Zod / RateLimit
       → Repositories → Supabase
       → revalidateTag / audit_logs / logger
```

## Environments

| Env | Purpose |
|-----|---------|
| `.env.local` | Local development |
| Vercel env | Production |
| CI secrets | Lint/type/test/build with placeholder keys |

## Health

`GET /api/health` — checks Supabase + Upstash configuration.
