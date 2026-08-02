# Phase 1.7 — Production Hardening

**Status:** Implemented in codebase (migrate + re-seed required on linked project)  
**Goal:** Resolve NO-GO blockers from `FINAL_PRODUCTION_AUDIT.md` without Phase 2 features.

## Delivered

### Critical
1. **RLS DELETE leak** — `supabase/migrations/00011_phase17_rls_hardening.sql` splits SELECT / INSERT / UPDATE / DELETE; DELETE requires `*.manage` only.
2. **`assign_super_admin`** — locked to `service_role` / `postgres`; revoked from `PUBLIC`, `anon`, `authenticated`.
3. **Admin gate** — middleware + `admin/layout` require authenticated user, active profile, and admin capability via `get_my_permission_keys()` / `requireAdminAccess()`.

### High
4. About CMS — `updateAboutAction` + wired form.
5. Contact CMS — settings CRUD + inbox list/status.
6. Settings Manager — wired to `updateSiteSettingsAction`.
7. Media Library — upload / replace / delete / folders / alt metadata.
8. Services — create / update / soft-delete / publish / order / images.
9. SEO Manager — `/admin/seo` persists title, description, OG, Twitter, canonical, robots, JSON-LD.

### Medium
10. Sentry — `src/instrumentation.ts` initializes SDK when `SENTRY_DSN` is set.
11. Lighthouse — run against staging after deploy (manual gate; see audit v2).
12. API Health — live Supabase + Upstash Redis ping.
13. Cache — homepage upserts fixed (`onConflict`); tags retained.
14. Audit logs — `listAuditLogsAction` + `audit_logs.manage` seeded; service-role inserts only.
15. Translations — DB-backed editor with live values.

## Apply on linked project

```bash
npx supabase db push
npm run db:seed:build
npm run db:seed:linked
```

Then assign Super Admin (SQL editor / service role only):

```sql
SELECT public.assign_super_admin('<user-uuid>');
```
