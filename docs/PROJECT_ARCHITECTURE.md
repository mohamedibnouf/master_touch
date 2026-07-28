# Project Architecture — Master Touch CMS (Phase 1)

## Overview

Master Touch is an enterprise multilingual corporate website with a CMS admin panel.
Stack: **Next.js 16 App Router**, **React 19**, **TypeScript (strict)**, **Tailwind CSS**, **next-intl**, **Supabase/PostgreSQL**, **Zod**, **React Hook Form**, **Framer Motion**, **TanStack**, **Chart.js**.

## Clean Architecture layers

```text
presentation  →  actions (Server Actions)  →  application  →  domain
                                              ↑
                                    infrastructure (repositories, Supabase)
```

| Layer | Path | Responsibility |
|-------|------|----------------|
| Presentation | `src/presentation`, `src/app` | UI, layouts, feature forms |
| Actions | `src/actions` | Boundary for mutations, validation entry |
| Application | `src/application` | Use-case orchestration |
| Domain | `src/domain` | Policies, locale helpers, pure rules |
| Infrastructure | `src/infrastructure` | Supabase clients, repositories, demo data |

## Feature-based structure

Public features live under `src/app/[locale]/*` and `src/presentation/features/*`.
Admin features live under `src/app/admin/*`.

## Repository pattern

`content.repository.ts` is the read facade for homepage, about, services, contact, theme, settings, SEO.
When Supabase is not configured, repositories fall back to `demo-data.ts` (profile-seeded content).

## Rendering strategy

- Public marketing pages: Server Components + SSG where possible (`generateStaticParams`)
- Admin dashboard: dynamic (auth-sensitive)
- Chart.js: client-only via `dynamic(..., { ssr: false })`
- Contact/auth forms: Client Components

## i18n

- Locales: `ar` (default, RTL), `en` (LTR)
- UI chrome: `messages/ar.json`, `messages/en.json` via next-intl
- CMS content: DB translations tables (seeded) / demo repository

## Related docs

- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- [API_STRUCTURE.md](./API_STRUCTURE.md)
- [RBAC_PERMISSIONS.md](./RBAC_PERMISSIONS.md)
- [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)
- [CMS_GUIDE.md](./CMS_GUIDE.md)
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)
- [SETUP.md](./SETUP.md)
