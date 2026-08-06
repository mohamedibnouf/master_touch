# Invite User Restore

**Date:** 2026-08-06  
**Issue:** After RBAC wiring, **Invite User** appeared to vanish from `/admin/users`  

---

## Why the button disappeared

### Commit trail

| Commit | Effect |
|--------|--------|
| `53685c0` | Invite button lived on the **server page**; gated with `disabled={!canManage}` — always in the header |
| `5ec3a91` | Button moved into `UsersAdminClient` (correct) **but** the server page gained an early return |

### Root cause (regression)

In `src/app/admin/users/page.tsx` after `5ec3a91`:

```tsx
if (!usersResult.ok && !usersResult.data.length) {
  return <EmptyState ... />;  // ← header + Invite User never mounted
}
```

Whenever `listAdminUsersAction()` failed (e.g. authorization/transient DB error) **or** returned an empty error payload, the page rendered **only** `EmptyState`.

That removed:

- The page title row  
- The **Invite User** button  
- The invite dialog client tree  

So the feature looked “deleted” even though `UsersAdminClient` still contained the button.

This was **not** an intentional product removal and **not** required for RBAC.

---

## Fix (kept all RBAC)

1. **Removed the early return** — `/admin/users` always renders `UsersAdminClient`.  
2. List failures surface as `listError` inside the client (banner), **without** stripping the header.  
3. Invite button is **visible only when** `can(permissions, "users.manage")` (Super Admin `*` included).  
4. Click still opens `AdminModal` → `inviteAdminUserAction`.  
5. Join fallback in `getCurrentUserPermissions` also treats `roles.slug === "super_admin"` as `["*"]` if RPC path is empty.

No duplicate buttons. No redesign.

---

## Files modified

| File | Change |
|------|--------|
| `src/app/admin/users/page.tsx` | Always render client; pass `listError`; drop EmptyState early return |
| `src/presentation/features/admin/UsersAdminClient.tsx` | Restore header Invite button (permission-gated); keep dialog + flow |
| `src/lib/permissions/index.ts` | Super Admin slug fallback in join path |
| `docs/INVITE_USER_RESTORE.md` | This document |

---

## How the invite flow works

```
User with users.manage (or *)
  → Invite User visible in header
  → onClick → setOpen(true) → AdminModal
  → Form: email (HTML5 + server regex), full_name, role_id
  → inviteAdminUserAction
       → requirePermission("users.manage")
       → validate email / name / role
       → supabase.auth.admin.inviteUserByEmail(...)
       → profiles update (name) via trigger + explicit update
       → user_roles insert (initial role)
       → audit log + revalidatePath("/admin/users")
  → Success banner or in-dialog error
```

Roles admin is unchanged and continues to use the permission matrix modal.

---

## Verification checklist

- [x] Invite User restored in original header location  
- [x] Visible only with `users.manage` / `*`  
- [x] Opens invite dialog  
- [x] Email validation + role assignment + Supabase invite  
- [x] Success / error messaging  
- [x] Single button (no duplicates)  
- [x] `npm run lint` / `typecheck` / `build`
