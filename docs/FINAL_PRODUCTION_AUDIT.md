# Final Production Readiness Audit — Master Touch CMS

**Date:** 2026-08-02  
**Scope:** Full-stack audit of schema, security, CMS, SEO, ops, and deployment readiness  
**Constraint:** Audit / validate / document only — no new product features  
**Related:** [PHASE_1_5_AUDIT_REPORT.md](./PHASE_1_5_AUDIT_REPORT.md), [PHASE_1_6_PRODUCTION_VALIDATION.md](./PHASE_1_6_PRODUCTION_VALIDATION.md), [SETUP.md](../SETUP.md)

---

## Executive verdict

| Metric | Value |
|--------|------:|
| **Production readiness score** | **54 / 100** |
| **Go / No-Go** | **NO-GO** |

The project has a **strong Phase 1 foundation**: ordered migrations, seed pipeline (CLI v2), bilingual public shell, theme persistence, rate limiting, AppError hierarchy, and CI lint/typecheck/unit/build.

It is **not production-ready as an enterprise CMS** until Critical security gaps and incomplete admin CRUD are resolved, and Phase 1.6 live validation is completed.

**What can ship later (after blockers):** public marketing site with seeded content, robots/sitemap basics, theme manager, password auth for a single Super Admin — still only after Critical RLS/RPC fixes.

**What cannot ship yet:** multi-role admin, About/Services/Contact/Settings/Media/SEO CMS, claim of Lighthouse ≥95, or “monitoring ready” without real Sentry instrumentation.

---

## Scorecard (30 areas)

| # | Area | Status | Score | Notes |
|---|------|--------|------:|-------|
| 1 | Database integrity | Pass | 8.5 | Migrations `00001`–`00010` coherent |
| 2 | Seed integrity | Pass | 9.0 | `db:seed:build` + single `sql_paths` entry |
| 3 | Foreign keys | Partial | 7.5 | Core graph solid; profile audit cols lack FK |
| 4 | RLS | Fail | 4.5 | View perms can DELETE via `FOR ALL` USING |
| 5 | Storage policies | Partial | 7.0 | Buckets OK; policies not idempotent |
| 6 | Authentication | Partial | 5.5 | Session gate only; open-redirect risk on `next` |
| 7 | RBAC | Fail | 4.0 | `assign_super_admin` callable; perm resolve broken for non-admins |
| 8 | CMS CRUD | Partial | 4.0 | Real + stub mix (`saveModuleAction`) |
| 9 | Homepage Builder | Partial | 6.0 | Updates work; slides/errors fragile |
| 10 | About Builder | Fail | 2.0 | Uncontrolled fields + stub save |
| 11 | Services Builder | Fail | 1.5 | Read-only; Create/Edit not CMS |
| 12 | Contact Builder | Fail | 2.0 | Stub save; inbox empty |
| 13 | Translation Manager | Partial | 3.0 | Real upsert; hardcoded UI rows |
| 14 | Theme Manager | Pass | 8.0 | End-to-end Supabase write |
| 15 | Settings Manager | Fail | 2.0 | Stub UI; real action unused |
| 16 | Media Library | Fail | 2.0 | Real actions; static admin UI |
| 17 | SEO Manager | Fail | 1.0 | No admin module; write RLS missing |
| 18 | Sitemap | Partial | 5.0 | Core locales; no service slugs |
| 19 | robots.txt | Pass | 8.0 | Disallows `/admin`, `/api` |
| 20 | Structured Data | Partial | 5.0 | Org + service/breadcrumb; org hardcoded |
| 21 | Performance | Partial | 6.0 | Tagged cache; no `next/image`; force-dynamic |
| 22 | Lighthouse | Partial | 4.0 | No baseline / CI gate |
| 23 | Accessibility | Partial | 7.0 | Skip link, labels; root `lang` fixed to `ar` |
| 24 | API Health | Partial | 6.0 | Env presence only, not live pings |
| 25 | Upstash | Partial | 7.0 | Rate limit real; not used as data cache |
| 26 | Cache invalidation | Pass | 8.0 | Tags + paths on CMS writes |
| 27 | Audit logs | Partial | 7.0 | Writes present; no viewer UI |
| 28 | Error handling | Pass | 8.0 | AppError + route/global handlers |
| 29 | CI pipeline | Partial | 7.0 | Lint/type/unit/build/audit; no e2e/axe |
| 30 | Production deployment | Partial | 6.0 | SETUP solid; Phase 1.6 unchecked |
| | **Average** | | **~5.4 / 10 → 54 / 100** | |

---

## Detailed findings

### 1–3. Database, seeds, foreign keys

**Pass / strong**

- Migrations `supabase/migrations/00001_extensions.sql` → `00010_phase15_indexes.sql` build enums → RBAC → CMS → modules → media/theme → RLS → storage → indexes.
- Seed modules `01`–`09` enforced by `scripts/build-seed.mjs`; `config.toml` registers only `./seed.sql` (no double-apply with `./seed/*.sql`).
- Content FKs and cascades are generally correct.

**Remaining**

- Medium: RLS/storage policies use non-idempotent `CREATE POLICY`.
- Low: `profiles.created_by` / `updated_by` have no FK.
- Low: `assign_super_admin` lives in seed, not a migration.

### 4–5. RLS & storage

**Fail / Partial — Critical**

PostgreSQL `DELETE` uses `USING` only. Policies such as `homepage_sections_admin` put `homepage.view` in `USING` of `FOR ALL`, so a view-only role can **delete** rows.

Same pattern appears across homepage, about, services, media, theme, settings, roles, and user_roles in `00007_rls_policies.sql`.

Additional High issues:

- `page_seo` / `page_translations` / some translation admin paths: SELECT without write policies.
- `audit_logs_insert` and public `contact_messages` inserts use permissive `WITH CHECK (TRUE)`.
- Storage buckets defined; app uploads via service role (OK only if `requirePermission` always holds).

### 6–7. Authentication & RBAC

**Partial / Fail — Critical**

- `middleware.ts` requires **any** Supabase session for `/admin` — no permission, role, or `is_active` check.
- `loginAction` redirects to `next` without same-origin / path allowlist (open redirect risk).
- `assign_super_admin` is `SECURITY DEFINER` without `REVOKE EXECUTE FROM PUBLIC, anon, authenticated` → privilege escalation via RPC.
- App `getCurrentUserPermissions()` reads RBAC tables under RLS that themselves require elevated perms → non–super-admin roles often resolve empty permissions (except early super-admin exit).
- Users/roles admin pages are static demo data.

### 8–17. CMS builders

| Module | Reality |
|--------|---------|
| Theme | Real `updateThemeAction` → `theme_settings` |
| Homepage | Real `updateHomepageSectionAction`; slides/settings incomplete; success UI ignores errors |
| About / Contact / Settings | `saveModuleAction` — **audit only, no DB write**; forms often uncontrolled |
| Settings | Orphaned `updateSiteSettingsAction` unused by UI |
| Services | No create/update; “Edit” links to public site |
| Translations | Backend upsert real; UI hardcoded + ignores inputs |
| Media | `listMediaAssets` / `uploadMediaAction` real; admin page uses placeholders |
| SEO Manager | No admin route; no write actions; RLS write gap |

Preview fallbacks in `content.repository.ts` still return seed-like data on any DB failure — can mask empty/broken production DB.

### 18–20. SEO surfaces

- **robots.txt:** Pass — sensible allow/disallow + sitemap link.
- **Sitemap:** Core AR/EN routes only; missing `/services/[slug]`; `lastModified` always “now”.
- **JSON-LD:** Organization on locale layout; service + breadcrumb on detail; organization data not driven by `site_settings`; unused FAQ/article helpers.

### 21–23. Performance, Lighthouse, a11y

- Tagged `unstable_cache` for theme/settings/translations; homepage content not cached.
- Locale layouts `force-dynamic`; no `next/image` in marketing surfaces.
- No recorded Lighthouse baseline; Phase 1.6 performance item unchecked.
- Skip link, ARIA on nav, labeled forms present; root `<html lang="ar">` even on `/en`; no axe in CI.

### 24–28. Health, Upstash, cache, audit, errors

- `/api/health` checks env presence only (not live Redis/Supabase ping); Sentry=`ok` if DSN set though SDK is not initialized.
- Upstash used for **rate limits** (login/forgot/contact); not an application data cache; reset-password unthrottled.
- Cache invalidation via `revalidateTag` / `revalidatePath` on real CMS writes — Pass.
- Audit writes from actions; no admin viewer; IP/UA columns unused; fail-open on insert.
- AppError + `toActionError` + `error.tsx` / `global-error.tsx` — Pass.

### 29–30. CI & deployment

- CI: lint → typecheck → unit → build → npm audit. Missing: e2e, format, axe, coverage thresholds.
- SETUP documents link / push / reset / seed. Phase 1.6 checklist entirely unchecked. DEPLOYMENT_GUIDE under-emphasizes Upstash (required for health + rate limits).
- Sentry package present; soft logger bridge only — no `instrumentation.ts` / `Sentry.init` / `withSentryConfig`.

---

## Remaining issues (by severity)

### Critical (block production)

1. RLS `FOR ALL` + view permission in `USING` → DELETE privilege leak.
2. `assign_super_admin` executable by authenticated/anon unless revoked; move to migration + lock down.
3. Admin middleware is session-only (any logged-in user reaches `/admin`).
4. Non–super-admin permission resolution broken under current RLS (empty permission sets).
5. Phase 1.6 live validation incomplete (migrations/seeds/auth/RBAC/CMS not signed off in a validation report).
6. CMS stubs: About / Contact / Settings “Save” does not persist; Media/SEO/Services builders incomplete.

### High

7. Open redirect via login `next` parameter.
8. Homepage admin read filtered by public `is_enabled` RLS — disabled sections disappear from builder.
9. Homepage translation upsert likely missing correct `onConflict` for `(section_id, locale)`.
10. No write RLS / actions for `page_seo` (SEO Manager).
11. Health endpoint false-healthy (config-only); Sentry claim misleading.
12. DEPLOYMENT_GUIDE incomplete vs required Upstash.
13. No Lighthouse/a11y baseline or CI gate.
14. Sitemap omits service detail URLs.

### Medium

15. Preview fallback masks DB outages on public + admin reads.
16. Users/roles admin UI is demo data.
17. No `next/image`; hero CSS backgrounds hurt LCP.
18. Thin automated tests (domain helpers + health smoke).
19. Audit log UI missing; contact inbox not wired.
20. Reset password not rate-limited.
21. Root HTML `lang` not locale-aware.
22. Security headers lack CSP (and HSTS if not provided by host).

### Low

23. Non-idempotent policy migrations.
24. Profile audit UUID columns without FK.
25. Raw error messages in client error UI.
26. Private storage bucket unused by upload path.
27. Organization JSON-LD hardcoded.

---

## Nice-to-have improvements

- Wire unused real actions (`updateSiteSettingsAction`, media list/upload) into existing admin pages (no new modules — complete stubs).
- Add service slugs to `sitemap.ts` from `getServices`.
- Tag-cache homepage sections + invalidate on homepage update.
- Playwright smoke for `/ar`, `/en`, login redirect; axe on one public page in CI.
- Admin audit log read-only list (permission already seeded: `audit_logs.view`).
- Rate-limit reset-password.
- Move `assign_super_admin` into a migration; document SQL-editor-only execution.
- CI check: `npm run db:seed:build` is clean / seed.sql not drifted.
- CSP report-only → enforce; HSTS on custom domain.
- LocalBusiness / ContactPage JSON-LD from contact settings.

---

## Security recommendations

1. **Split RLS by command:** `SELECT` for `*.view`; `INSERT/UPDATE` for update/create; `DELETE` only for manage — never include view in DELETE `USING`.
2. **`REVOKE EXECUTE`** on `assign_super_admin` from `PUBLIC`, `anon`, `authenticated`; grant only to `service_role` or run via SQL editor.
3. **Admin gate:** middleware + `admin/layout` must require active profile + `dashboard.view` (or any CMS permission).
4. **Allowlist `next`:** relative paths starting with `/admin` only.
5. **SECURITY DEFINER `get_my_permissions()`** (or self-select policies) so `requirePermission` works for content roles.
6. Tighten `audit_logs` insert (service role / definer only) and contact inserts (app + optional DB constraints).
7. Add CSP; keep `X-Frame-Options` / `nosniff` / Permissions-Policy already in `next.config.ts`.
8. Stop treating preview fallbacks as production success — fail closed when Supabase is configured but queries error.
9. Do not expose service role to the browser; keep admin mutations on server actions only.

---

## Performance recommendations

1. Adopt `next/image` for hero/service/about media (replace CSS `bg-[url]` and raw `<img>` where possible).
2. Cache homepage section reads with `unstable_cache` + tag; already revalidate paths on update.
3. Revisit blanket `force-dynamic` — prefer static/ISR for public marketing pages where auth cookies are not required.
4. Measure Lighthouse on staging after image work; target LCP & CLS before claiming ≥95.
5. Keep Framer Motion scoped; avoid large client islands on first paint.
6. Upstash: keep for rate limits; optional later for hot translation blobs if DB latency warrants it.
7. Ensure CDN/cache headers for `/_next/static` via Vercel defaults; set correct `NEXT_PUBLIC_APP_URL` for metadata/sitemap.

---

## Final Go / No-Go decision

### **NO-GO for production launch**

| Gate | Result |
|------|--------|
| Schema + seed pipeline | Ready for staging use |
| Security (RLS / RPC / admin gate) | **Blocked** |
| Multi-role CMS CRUD | **Blocked** |
| SEO Manager / Media UI / Services CMS | **Blocked** |
| Phase 1.6 live validation | **Not completed** |
| Observability (real Sentry) | **Not completed** |
| Lighthouse ≥95 evidence | **Not completed** |

### Minimum path to **Conditional Go** (staging / limited Soft Launch)

1. Fix Critical RLS DELETE leak + revoke `assign_super_admin` + admin permission gate + open-redirect fix.  
2. Complete or clearly disable stub admin modules (About/Contact/Settings/Media) so operators are not misled.  
3. Finish Phase 1.6 checklist with a signed `PRODUCTION_VALIDATION_REPORT.md` against the linked Supabase + Upstash project.  
4. Health check: live Upstash ping (and preferably Supabase) **or** document degraded semantics for ops.  
5. Wire Sentry properly **or** remove production monitoring claims.

### Path to **Go** (full CMS production)

All Conditional Go items, plus: real Services/SEO/Media/Translations UIs; RBAC self-read; users/roles management; sitemap service URLs; Lighthouse + a11y evidence; e2e in CI.

---

## Evidence index (primary paths)

| Concern | Paths |
|---------|--------|
| Migrations / RLS / storage | `supabase/migrations/00001`–`00010`, especially `00007`, `00008` |
| Seeds | `supabase/seed/*`, `supabase/seed.sql`, `scripts/build-seed.mjs`, `supabase/config.toml` |
| Auth / middleware | `middleware.ts`, `src/actions/auth.ts`, `src/app/[locale]/(auth)/*` |
| RBAC | `src/lib/permissions/index.ts`, `src/domain/rbac/policy.ts`, seed `01`/`02` |
| CMS actions | `src/actions/cms.ts`, `media.ts`, `contact.ts` |
| Admin UI | `src/app/admin/**` |
| SEO | `src/app/sitemap.ts`, `robots.ts`, `src/lib/seo/*` |
| Cache / rate limit | `content.repository.ts`, `translations.repository.ts`, `rate-limit/service.ts` |
| Health / errors | `src/app/api/health/route.ts`, `src/domain/shared/errors.ts`, `global-error.tsx` |
| CI / deploy | `.github/workflows/ci.yml`, `SETUP.md`, `docs/DEPLOYMENT_GUIDE.md` |

---

## Sign-off

| Role | Decision | Date |
|------|----------|------|
| Production Readiness Review (automated audit) | **NO-GO (54/100)** | 2026-08-02 |
| Human product / security owner | _Pending_ | |

**Recommendation:** Treat current codebase as **Foundation + Hardening complete, Production Validation incomplete**. Freeze feature work; execute Critical security fixes and Phase 1.6 validation before any public CMS go-live.
