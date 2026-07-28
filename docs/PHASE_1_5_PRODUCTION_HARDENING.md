# Phase 1.5 — Production Hardening

**Goal:** Raise foundation quality from ~80 toward **97+ overall** before any Phase 2 modules.

**Decisions locked**

| Topic | Choice |
|-------|--------|
| Rate limiting | **Upstash Redis** (`@upstash/redis` + `@upstash/ratelimit`) |
| Demo mode | **Removed.** Runtime requires valid Supabase + Upstash env |
| Translations | Database-first with tagged cache; JSON files = bootstrap fallback only |
| Auth | Supabase Auth only (no demo cookie) |
| Monitoring | Sentry + OpenTelemetry hooks via env |

## Priority 1 — done

- [x] Real Supabase repositories (no demo-data)
- [x] Auth session + profile last_login + permissions loading
- [x] `requirePermission()` on privileged Server Actions
- [x] DB translation manager + cache tags
- [x] Global settings + theme persistence actions
- [x] Upstash RateLimit service

## Priority 2 — done (code)

- [x] AppError hierarchy + global handlers
- [x] Centralized logging + audit
- [x] Health check + monitoring hooks
- [x] Zod on auth/contact/theme/translations/media
- [x] DB index review migration `00010`
- [x] SEO schemas (Organization, Service, Breadcrumb, FAQ, Article, Project stub)
- [x] Vitest + Playwright smoke + GitHub Actions
- [x] Docs suite

## Live verification (required for 97+)

- [ ] Supabase project connected + migrations/seeds
- [ ] Upstash connected
- [ ] Super Admin assigned
- [ ] Staging Playwright auth/RBAC suite green
- [ ] axe WCAG AA CI gate
