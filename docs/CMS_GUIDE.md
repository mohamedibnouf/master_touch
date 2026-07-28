# CMS Guide — Phase 1

## Admin modules

| Route | Editable content |
|-------|------------------|
| `/admin/homepage` | Section enable, order, AR/EN title/body |
| `/admin/about` | History, vision, mission, CEO message (AR/EN), values list |
| `/admin/services` | Service list (CRUD UI expands when Supabase connected) |
| `/admin/contact` | Headlines, intros, notify email, channels, inbox |
| `/admin/media` | Library preview; uploads after Storage connect |
| `/admin/theme` | Colors, radius, fonts + light/dark/system mode |
| `/admin/translations` | Namespace keys AR/EN |
| `/admin/settings` | Site names, URL, default locale |
| `/admin/users` / `/admin/roles` | RBAC management UI |
| `/admin/profile` | Profile + logout confirmation |

## Content source priority

1. Supabase tables (when configured)
2. Demo repository seeded from company profile

## UX states (admin)

Every module should surface:

- Loading (spinner / dynamic import)
- Empty
- Error
- Success banner after save
- Confirm dialog for destructive actions (logout/delete)

## Demo mode

Without `.env.local` Supabase keys, saves log to server console and still return success so editors can rehearse flows.
