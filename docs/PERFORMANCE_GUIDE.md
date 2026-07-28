# Performance Guide

## Rendering

- Public + admin routes: `force-dynamic` with tagged caches for theme/settings/translations
- Chart.js loaded via `next/dynamic` (`ssr: false`)
- Prefer Server Components for data fetching

## Caching

| Tag | Source |
|-----|--------|
| `theme` | theme_settings |
| `settings` | site_settings |
| `translations` / `translations:{locale}` | translations table |

Invalidate with `revalidateTag` after CMS writes.

## Database

- Partial / composite indexes in `00010_phase15_indexes.sql`
- Select only needed columns on list endpoints
- Avoid N+1 — use nested selects carefully

## Images

- Use `next/image` for remote Supabase URLs when wiring media UI
- Lazy-load non-LCP media (`loading="lazy"`)

## Bundle

- Keep admin chart code client-only
- Do not import Node-only packages into client components
