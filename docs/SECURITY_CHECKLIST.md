# Security Checklist — Phase 1

## Authentication

- [x] Email/password via Supabase Auth (when connected)
- [x] Forgot / reset password flows
- [x] Demo cookie `mt_demo_admin` httpOnly + sameSite + secure in production
- [x] Remember-me maxAge toggle
- [x] Login/forgot rate limiting (in-memory; replace with Redis in prod)

## Authorization

- [x] RBAC tables + `has_permission` SQL helper
- [x] RLS on all CMS tables
- [x] Middleware gate for `/admin` when Supabase configured
- [ ] Enforce permission checks on every admin Server Action (expand before Phase 2 launch)

## Input / output

- [x] Zod validation on auth, contact, theme
- [x] `sanitizePlainText` strips angle brackets / control chars
- [x] Contact form rate limited by IP

## Headers / cookies

- [x] Security headers in `next.config.ts`
- [x] No `poweredBy` header
- [ ] CSRF: Server Actions rely on Next origin checks; document for custom API later

## Storage

- [x] Bucket policies for `media` and `public-assets`
- [ ] Signed URL downloads for private media in admin UI (Phase 2 polish)

## Secrets

- [x] `.env.example` without secrets
- [x] Service role server-only
- [ ] Rotate keys after first production deploy

## XSS / injection

- [x] React escaping by default
- [x] JSON-LD stringified via `JSON.stringify`
- [ ] Rich text HTML sanitizer when TipTap lands (Phase 2)
