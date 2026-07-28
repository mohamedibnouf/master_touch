# Component Guide — Phase 1

## UI primitives (`src/presentation/components/ui`)

- `Button` — CVA variants (`default`, `accent`, `outline`, `ghost`, `secondary`)
- `Input`, `Label`, `Textarea`, `Card`, `Badge`, `Separator`, `Switch`

## Layout

- `SiteHeader` / `SiteFooter` / `LocaleSwitcher` — public chrome, mobile nav, skip link
- `AdminSidebar` / `AdminTopbar` — responsive admin shell + theme mode switcher

## Marketing

`HeroSlider`, `StatsCounter`, `ValuesGrid`, `ServiceCard`, `CtaBanner`, `ContactMap`, `SectionHeading`, `TextBlock`

## Admin shared

`LoadingState`, `EmptyState`, `ErrorState`, `SuccessBanner`, `ConfirmDialog`

## Shared

`ThemeProvider` (next-themes), `ThemeModeSwitcher`

## Conventions

1. Prefer Server Components; mark `"use client"` only for interactivity
2. Use `cn()` for class merging
3. Visible chrome strings via `next-intl`
4. CMS body/title/content from repositories, never hardcoded in marketing pages
5. Focus rings: `focus-visible:ring-2 focus-visible:ring-[var(--ring)]`
