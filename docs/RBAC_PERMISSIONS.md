# RBAC Permissions — Phase 1

## Roles

| Slug | Description |
|------|-------------|
| `super_admin` | Bypass all checks via `is_super_admin()` |
| `administrator` | Full manage except deleting super admin (enforced in app rules) |
| `content_manager` | CMS CRUD + publish + media |
| `marketing` | Content update + media create/update |
| `hr` | Dashboard + media (careers Phase 2) |
| `editor` | Content update, no delete/publish |
| `viewer` | `*.view` only |

## Permission key format

`{module}.{action}` where action ∈ `view | create | update | delete | publish | manage`

## Phase 1 modules

`dashboard`, `users`, `roles`, `homepage`, `about`, `services`, `contact`, `contact_messages`, `media`, `theme`, `translations`, `settings`, `audit_logs`

## Runtime checks

- SQL: `has_permission(auth.uid(), 'module.action')` used by RLS
- App: `src/lib/permissions` + `src/domain/rbac/policy.ts`
- Middleware: protects `/admin` when Supabase is configured

## Assign first Super Admin

```sql
SELECT public.assign_super_admin('<auth-user-uuid>');
```
