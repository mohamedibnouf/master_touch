# API Structure — Phase 1

Phase 1 prefers **Server Actions** over REST endpoints.

## Server Actions

| Action file | Functions | Auth | Notes |
|-------------|-----------|------|-------|
| `src/actions/auth.ts` | `loginAction`, `logoutAction`, `forgotPasswordAction`, `resetPasswordAction` | Public / session | Rate-limited; secure cookie flags |
| `src/actions/contact.ts` | `submitContactMessage` | Public | Zod + sanitize + rate limit |
| `src/actions/cms.ts` | `saveDemoCmsAction`, `updateThemeAction`, `updateHomepageSectionAction` | Admin (demo or session) | Theme validated with Zod |
| `src/actions/media.ts` | `listMediaAssets`, `writeAuditLog` | Admin | Demo list when offline |

## Read APIs (repositories)

Called from Server Components:

- `getHomepageSections(locale)`
- `getAboutContent(locale)`
- `getServices(locale)` / `getServiceBySlug`
- `getContactContent(locale)`
- `getThemeSettings` / `getSiteSettings`
- `getPageSeo(slug, locale)`

## Future REST (Phase 2+)

Reserve `src/app/api/` for webhooks (analytics, email) and authenticated exports only.

## Error contract

Actions return discriminated unions:

```ts
{ ok: true, demo?: boolean } | { ok: false, error: string }
```
