# RBAC Disabled Button Debug

**Date:** 2026-08-06  
**Scope:** Why Admin **Invite user** / **Configure permissions** stayed disabled despite correct DB roles  
**Constraint:** No new features · No UI redesign  

---

## Verdict

The buttons were **not disabled by a failed permission load**.

They were **hardcoded `disabled`** in the page JSX as an intentional RC1 product gate (“not enabled in this release”).  
Loaded permissions were never consulted for these two controls.

---

## Button 1 — Invite user (Users)

| Step | Detail |
|------|--------|
| **1. File** | `src/app/admin/users/page.tsx` |
| **2. Line (before fix)** | ~16 |
| **3. Disabled condition (before)** | `disabled` with **no expression** (always true) |
| **4. Runtime boolean (before)** | `disabled === true` always |
| **5. Why false/true** | Not a boolean check — attribute was unconditional. Title: `"Invite flow is not enabled in this release"` |
| **6. Where permissions load** | `getCurrentUserPermissions()` in `src/lib/permissions/index.ts` → RPC `get_my_permission_keys()` → fallback `is_super_admin` → join on `user_roles` / `role_permissions` / `permissions` |
| **7. Why UI ≠ DB** | UI ignored DB. List page already required `users.view` via `listAdminUsersAction`; manage button never called `can(..., "users.manage")` |

### After fix

```ts
const canManageUsers = can(permissions, "users.manage");
// disabled={!canManageUsers}
```

For Super Admin: permissions include `"*"` (or `users.manage`) → `canManageUsers === true` → **button clickable**.

---

## Button 2 — Configure permissions (Roles)

| Step | Detail |
|------|--------|
| **1. File** | `src/app/admin/roles/page.tsx` |
| **2. Line (before fix)** | ~19 |
| **3. Disabled condition (before)** | `disabled` with **no expression** (always true) |
| **4. Runtime boolean (before)** | `disabled === true` always |
| **5. Why false/true** | Unconditional. Title: `"Permission matrix editor is not enabled in this release"` |
| **6. Where permissions load** | Same as above |
| **7. Why UI ≠ DB** | Same — hardcoded release gate; list already used `roles.view` |

### After fix

```ts
const canManageRoles = can(permissions, "roles.manage");
// disabled={!canManageRoles}
```

For Super Admin: `canManageRoles === true` → **button clickable**.

---

## Permission load path (runtime)

```
requireAuthUser()
  → supabase.rpc("get_my_permission_keys")
      → if is_super_admin(uid): ["*"]
      → else DISTINCT permission keys from user_roles → role_permissions → permissions
  → if RPC missing/empty: is_super_admin → ["*"] else join fallback
  → can(permissions, key)
      → "*" OR exact key OR "{module}.manage"
```

SQL source of truth: `supabase/migrations/00011_phase17_rls_hardening.sql` (`get_my_permission_keys`).  
App policy: `src/domain/rbac/policy.ts`.

**Loaded permissions did not “differ” from the database for these buttons** — the buttons never read them.

Sidebar links `/admin/users` and `/admin/roles` were already enabled (no permission gate on nav).

---

## Secondary hardening (loader)

**Bug risk:** `getCurrentUserPermissions` previously returned an **empty array** from a successful RPC without falling through to `is_super_admin` / join.

**Fix:** Only short-circuit on non-empty RPC results; if `[]`, still run Super Admin + join fallback.

---

## What was changed

1. `src/app/admin/users/page.tsx` — `disabled={!can(permissions, "users.manage")}`  
2. `src/app/admin/roles/page.tsx` — `disabled={!can(permissions, "roles.manage")}`  
3. `src/lib/permissions/index.ts` — empty RPC array no longer blocks Super Admin / join fallback  

**Not added:** invite email flow or permission-matrix editor (out of scope — no new features).  
Buttons are **clickable** for Super Admin / users with `*.manage`; they remain UI entry points until those flows are productized later.

---

## How to verify

1. Sign in as Super Admin (`user_roles` → `roles.slug = 'super_admin'`).  
2. Open `/admin/users` → **Invite user** is enabled (not greyed).  
3. Open `/admin/roles` → **Configure permissions** is enabled.  
4. Sign in as viewer-only → both stay disabled with permission title.
