# Phase 1.6 — Production Validation

**Status:** Waiting for real environment credentials.

**Scope:** Validation only — no new features.

## Checklist

- [ ] Supabase connection + migrations 00001–00010 + seeds
- [ ] RLS + Storage + Auth + RBAC + Super Admin
- [ ] Upstash Redis + rate limit + caches + `/api/health`
- [ ] CMS CRUD / uploads / i18n / SEO / permissions
- [ ] Security review (live)
- [ ] Performance + Lighthouse targets
- [ ] Cross-browser / responsive checks
- [ ] `PRODUCTION_VALIDATION_REPORT.md`
- [ ] Tag `v1.0.0-foundation` + CHANGELOG + Phase 1 freeze

## Required env (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_APP_URL=
```

Optional: `SENTRY_DSN`
