# Users / Roles Click Debug

**Date:** 2026-08-06  
**Scope:** “Invite User” and “Configure permissions” were clickable but did nothing  

---

## Root cause

Both buttons were **placeholder controls**:

- Rendered as `<Button type="button">` with **no `onClick`**
- **No Dialog/Modal state**
- **No Server Actions** for invite or role-permission updates

Authorization enablement was already fixed earlier. The remaining gap was **missing UI wiring and backend actions**, not RBAC.

---

## Per-button audit (before fix)

### Invite User

| # | Check | Result |
|---|--------|--------|
| 1 | Component | `src/app/admin/users/page.tsx` (server) rendered bare `Button` |
| 2 | `onClick` exists | **No** |
| 3 | Handler executes | **N/A** |
| 4 | Dialog state changes | **N/A** — no state |
| 5 | Dialog mounted | **No** |
| 6 | `preventDefault` / disabled | Disabled only when missing `users.manage`; when enabled, still no handler |
| 7 | React error | None (noop click) |
| 8 | Console errors | None |
| 9 | Server Action / API | **Missing** |
| 10 | Fix | Implement dialog + `inviteAdminUserAction` |

### Configure permissions (Role Management)

| # | Check | Result |
|---|--------|--------|
| 1 | Component | `src/app/admin/roles/page.tsx` bare `Button` |
| 2 | `onClick` exists | **No** |
| 3–8 | Same as above | Noop |
| 9 | Server Action / API | **Missing** matrix load/save |
| 10 | Fix | Role matrix modal + catalog/keys/save actions |

---

## What was missing

1. Client components to own `open` modal state  
2. Shared `AdminModal` shell  
3. `inviteAdminUserAction` (Supabase `auth.admin.inviteUserByEmail` + `user_roles`)  
4. `listPermissionCatalogAction` / `getRolePermissionKeysAction` / `setRolePermissionsAction`  

---

## How it was fixed

1. **`AdminModal`** in `AsyncStates.tsx` — dialog shell with close affordance  
2. **`UsersAdminClient`** — Invite button `onClick` → `setOpen(true)` → form → `inviteAdminUserAction`  
3. **`RolesAdminClient`** — Configure button `onClick` → matrix modal; per-role Configure; checkbox matrix → `setRolePermissionsAction`  
4. Pages pass list data + `canManage` into clients  
5. i18n keys for invite/role save copy  

### Click flow (after)

```
Invite User click
  → UsersAdminClient.setOpen(true)
  → AdminModal mounted
  → submit FormData
  → inviteAdminUserAction (users.manage)
  → auth.admin.inviteUserByEmail + user_roles insert
  → revalidate /admin/users

Configure permissions click
  → RolesAdminClient.setOpen(true)
  → load catalog + role keys
  → AdminModal with checkboxes
  → setRolePermissionsAction (roles.manage)
  → replace role_permissions rows
  → revalidate /admin/roles
```

---

## Files modified

| File | Change |
|------|--------|
| `src/presentation/components/admin/AsyncStates.tsx` | Add `AdminModal` |
| `src/presentation/features/admin/UsersAdminClient.tsx` | **New** invite UI |
| `src/presentation/features/admin/RolesAdminClient.tsx` | **New** role matrix UI |
| `src/app/admin/users/page.tsx` | Wire client |
| `src/app/admin/roles/page.tsx` | Wire client |
| `src/actions/admin-directory.ts` | Invite + permission matrix actions |
| `messages/en.json` / `messages/ar.json` | Labels |
| `docs/USERS_ROLES_CLICK_DEBUG.md` | This report |

---

## Notes / ops

- Invite requires Supabase Auth email (SMTP) configured; otherwise the action returns the Auth API error in the dialog.  
- Super Admin role still bypasses checks via `is_super_admin()`; matrix editing remains available for clarity.  
- Invite UI excludes assigning `super_admin` from the role dropdown (use SQL `assign_super_admin` for that).
