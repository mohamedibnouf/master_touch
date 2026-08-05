# Admin / CMS System Audit

**Project:** Master Touch  
**Date:** 2026-08-06  
**Scope:** Admin Panel + CMS data flows (no UI redesign; no business-rule changes)  
**Gates:** `npm run lint` ✓ · `npm run typecheck` ✓ · `npm run build` ✓

---

## Executive summary

The production CMS surface is **Homepage, About (page fields), Services, Contact (+ inbox), Media, Theme, Settings, Translations, SEO**, with **Auth** gated by middleware + layout + per-action `requirePermission`. Modules such as Projects, Team, Partners, Clients, Testimonials, Categories, Navigation, and standalone Gallery **do not exist** in schema/routes and were audited as out-of-scope absences—not defects.

This pass fixed real production defects: N+1 queries, unbounded lists, weak media validation, orphan risk on service create, fake Users/Roles/Dashboard/Profile data, and cache revalidation gaps—without changing CMS contracts or public UX.

---

## Scorecard

| Dimension | Score | Notes |
|-----------|------:|-------|
| Overall health | **8.6 / 10** | Solid dual-layer auth + RLS; remaining gaps are unfinished product modules |
| CRUD | **8.4 / 10** | Services/Media/SEO/Theme/Settings strong; About values/timeline/stats & branches lack admin CRUD |
| Security | **8.8 / 10** | Middleware + layout + action gates; service-role writes after app RBAC; RLS hardened in 00011 |
| Supabase | **8.5 / 10** | Indexes present; slug lookups fixed; limits added; deep homepage select still grows with slides |
| Performance | **8.3 / 10** | N+1 eliminated on Services/SEO/Homepage admin; media/translations capped |
| Database | **8.7 / 10** | Soft deletes, FKs, RBAC model sound; unused tables (`service_gallery`, etc.) unused by admin |
| Storage | **8.6 / 10** | MIME/size checks; orphan storage cleanup on failed insert/replace |
| Code quality | **8.2 / 10** | Actions centralized; some FormData parsing still manual |
| Maintainability | **8.0 / 10** | Clear module map; Users invite / Roles matrix still intentionally disabled |
| Scalability | **7.8 / 10** | Fine for corporate CMS scale; add pagination before thousands of media/translations |
| **Production readiness** | **8.7 / 10** | Enterprise-ready for implemented modules |

---

## Module inventory

### Exists and production-wired

| Module | C | R | U | D | Notes |
|--------|---|---|---|---|-------|
| Dashboard | — | ✓ | — | — | Live counts + recent audit (charts remain illustrative) |
| Homepage / Hero sections | — | ✓ | ✓ | — | Section enable/sort + AR/EN copy; no slide CRUD UI |
| About | — | ✓ | ✓ | — | Cover/CEO/media + translations; values/timeline/stats DB-only |
| Services | ✓ | ✓ | ✓ | Soft | Slug uniqueness, dual-locale titles, soft delete |
| Contact settings | — | ✓ | ✓ | — | Validated email/map URL |
| Contact messages | Public create | ✓ | Status | — | Cap 100; no hard delete |
| Media | ✓ | ✓ | ✓ | Soft+storage | Folder create; assets upload/replace/delete |
| Theme | — | ✓ | ✓ | — | Singleton + Zod |
| Site settings | — | ✓ | ✓ | — | Zod + revalidateTag |
| Translations | — | ✓ | ✓ | — | Upsert; list capped 5000 |
| SEO | — | ✓ | Upsert | — | Batched load; fixed page slugs |
| Users | — | ✓ | — | — | Real profiles+roles; invite disabled |
| Roles | — | ✓ | — | — | Real roles; configure matrix disabled |
| Profile | — | ✓ | Own name | — | Real profile update + logout |
| Authentication | Login/reset | ✓ | Password | Logout | Rate-limited |

### Does not exist (by product design)

Projects · Categories · Team · Partners · Clients · Testimonials · Navigation CMS · Gallery module · Files (separate from Media) · Permissions admin UI · Bulk actions · Realtime subscriptions

---

## Issues found

### Critical / High (fixed)

1. **`getServiceBySlug` loaded all published services** then `.find` — O(n) + large payload.  
2. **Admin Services N+1** — per-service translation queries despite join already available.  
3. **Admin SEO N+1** — page + SEO query per slug × locale (8+ round trips).  
4. **Admin Homepage double fetch** — identical heavy query for AR and EN.  
5. **Media upload** — no MIME/size validation; failed DB insert left storage orphans; replace same risk.  
6. **`deleteMediaAction` required `media.manage`** while seed grants `media.delete` (manage still implies via RBAC, but delete key is correct).  
7. **Service create** validated titles after insert → orphan service rows.  
8. **Users / Roles / Profile / Dashboard** showed demo/fake data in production admin.  
9. **Unbounded `listMediaAssets` / `listTranslationRows`**.  
10. **Weak validation** on contact notify email, map URL, site settings URL, service slugs / duplicate slugs.

### Medium (fixed)

11. Contact message status updates without UUID check / soft-delete filter.  
12. Locale path revalidation incomplete for some CMS writes (`/ar/...`, `/en/...`).  
13. Silent repository fallbacks lacked structured logging on slug lookup / admin detailed loads.  
14. Dashboard `dynamic(..., { ssr: false })` illegally used in a Server Component (build break during fix — resolved via client slot).

### Medium / Low (documented, not fully productized)

15. About **values / timeline / stats** — tables + RLS exist; no admin CRUD.  
16. Contact **branches / channels** — no admin CRUD.  
17. Homepage **slides** — no admin create/edit UI.  
18. `service_gallery` / `service_relations` — schema only.  
19. Invite user / configure permissions buttons — disabled (honest UX; no fake success).  
20. Dashboard charts still use sample Chart.js series (labels now backed by real KPI cards).  
21. No optimistic UI / realtime; acceptable for this CMS size.  
22. Migration `00006` theme defaults historically terracotta — seed/preview/layout already aligned to navy/royal.

### Security findings (verified OK)

- Admin routes: middleware session + `profiles.is_active` + permission RPC; layout `requireAdminAccess`.  
- Mutations: `requirePermission` then service-role client (app RBAC is source of truth; RLS protects non-service clients).  
- Public contact insert: Zod + sanitize + rate limit.  
- Login: Zod + rate limit + safe `/admin` redirect.  
- Storage: public-assets policies hardened in 00011; app uses admin client for uploads.  
- Audit log writes best-effort (failures logged, do not break UX).

---

## Issues fixed in this pass

| Fix | Location |
|-----|----------|
| Direct slug query for public service detail | `content.repository.ts` → `getServiceBySlug` |
| `getAdminServicesDetailed` single-query both locales | `content.repository.ts` + `admin/services/page.tsx` |
| `getHomepageSectionsPair` one DB round-trip | `content.repository.ts` + `admin/homepage/page.tsx` |
| Batched SEO load (2 queries) | `admin/seo/page.tsx` |
| Media MIME/size, cleanup, UUID checks, `media.delete` | `lib/media/constraints.ts`, `actions/media.ts` |
| Service create/update validation, duplicate slug, rollback soft-delete | `actions/cms.ts` |
| Contact/settings Zod & URL/email validation | `actions/cms.ts`, `lib/validations` |
| Media/translations list limits | `media.ts`, `translations.repository.ts` |
| Real users/roles/dashboard/profile | `actions/admin-directory.ts` + admin pages + `ProfileClient` |
| Dashboard charts client slot for RSC safety | `DashboardChartsSlot.tsx` |
| Message status UUID + deleted filter | `actions/cms.ts` |

---

## Remaining recommendations (non-blocking)

1. **Admin CRUD** for About values/timeline/stats and Contact branches/channels when product needs it.  
2. **Homepage slide manager** (create/reorder/media).  
3. **Cursor pagination** for media (>200) and translations (>5000).  
4. **User invite / role assignment** Server Actions with email invite flow.  
5. **Wire Chart.js** to real time-series (or remove charts to avoid illustrative metrics).  
6. **Optional RPC transaction** for service create (insert + translations) instead of compensate soft-delete.  
7. **Periodic storage GC** for soft-deleted assets whose files remain if remove failed.  
8. **E2E Playwright** suite: login → CRUD service → upload → logout → expired session.  
9. Do **not** invent Projects/Gallery routes without CMS schema — keep product scope honest.

---

## Validation

```bash
npm run lint      # pass
npm run typecheck # pass
npm run build     # pass
```

---

## Confirmation

- **Business logic / CMS behavior contracts:** unchanged for public content model and existing action shapes (additive validation and safer queries only).  
- **UI redesign:** none (presentation shells only where fake data was a production bug).  
- **Schema:** compatible; no breaking migrations required for these fixes.  
- **API contracts:** Server Action return shapes (`{ ok }` / `toActionError`) preserved.

**Verdict:** Implemented Admin/CMS modules meet **enterprise production readiness** for a mid-size multilingual corporate site, with documented backlog for unfinished collections.
