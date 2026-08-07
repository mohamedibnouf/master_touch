# Invite User Error Debug

**Date:** 2026-08-07  
**Symptom:** Invite dialog showed `{}` instead of a readable error  

---

## Root cause

`inviteAdminUserAction` wrapped Supabase Auth failures as:

```ts
throw new DatabaseError(inviteError.message, inviteError);
```

Auth Admin errors often have:

- empty / non-string `message`
- useful fields on `code`, `status`, `error_description`

`toActionError()` then returned `error: ""` (or a non-useful value). The client displayed that payload, which appeared as `{}` / blank instead of the real Auth/SMTP failure.

Business rules (permission check, email validation, invite + role assign) were **not** changed — only error extraction, logging, and response shape.

---

## Server action

**File:** `src/actions/admin-directory.ts`  
**Export:** `inviteAdminUserAction`

### Client

`createAdminClient()` (`src/infrastructure/supabase/admin.ts`):

- Requires `NEXT_PUBLIC_SUPABASE_URL` (via `assertSupabaseConfigured`)
- Requires `SUPABASE_SERVICE_ROLE_KEY` (rejects placeholder)
- Uses `@supabase/supabase-js` `createClient(url, serviceRoleKey)` — **service role**, not anon

### Invite call

```ts
await admin.auth.admin.inviteUserByEmail(email, {
  data: { full_name },
  redirectTo: `${NEXT_PUBLIC_APP_URL}/ar/login`,
});
```

Requires Supabase Auth **SMTP** (or built-in email) configured in the project dashboard. Without SMTP, Auth returns an API error that must be surfaced.

---

## Fix applied

1. Pre-check `SUPABASE_SERVICE_ROLE_KEY` presence (without logging the secret).  
2. **try/catch around each step:** permission → create client → load role → `inviteUserByEmail` → profile update → role assign.  
3. `logger.error` with full error context (sanitized via existing logger).  
4. Return always-serializable:

```ts
{
  ok: false,
  error: string,   // never empty when possible
  code: string,
  status: number,
  stack?: string,  // development only
}
```

5. Client formats `error · code=… · status=…` in the dialog.

---

## Verification checklist

| Check | How |
|-------|-----|
| `SUPABASE_SERVICE_ROLE_KEY` exists | Action returns explicit config error if missing/placeholder |
| Service role client | `createAdminClient()` only |
| `inviteUserByEmail` executed | Dedicated try/catch with SMTP-oriented fallback message |
| SMTP | Configure under Supabase → Project Settings → Auth → SMTP; failures now show Auth `message`/`code`/`status` |

---

## Files modified

| File | Change |
|------|--------|
| `src/actions/admin-directory.ts` | Structured invite error handling + logging |
| `src/presentation/features/admin/UsersAdminClient.tsx` | Display message/code/status/stack |
| `docs/INVITE_DEBUG.md` | This report |
