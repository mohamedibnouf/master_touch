# Invite User — Root Cause (error: "{}")

**Date:** 2026-08-07  
**Symptom:**

```json
{
  "ok": false,
  "error": "{}",
  "code": "APP_ERROR",
  "status": 500
}
```

---

## Failing step

Most likely: **`inviteUserByEmail`** (Supabase Auth Admin).

The previous parser treated Supabase `AuthApiError` as a generic `Error` and forced:

- `code: "APP_ERROR"`
- `status: 500`

…before reading Auth `code` / `status`.

---

## Original error (why `error` became `"{}"`)

1. `AuthApiError` **extends `Error`**.
2. `parseInviteError` hit this branch first:

```ts
if (error instanceof Error) {
  return {
    message: error.message || fallback,
    code: "APP_ERROR",
    status: 500,
  };
}
```

3. Separately, `JSON.stringify(authError)` on Auth errors yields **`"{}"`** because Auth fields are often non-enumerable. Any path that stringified the error object (or used a message equal to `"{}"`) produced the useless payload you saw.

So the **real** Auth fields (`message`, `code`, `status`, `name`) were discarded / overwritten.

---

## Root cause

**Error propagation bug**, not RBAC / SMTP config / schema:

- Wrong branch order (`instanceof Error` before Auth field extraction)
- Forced `APP_ERROR` / `500` for Auth failures
- Unsafe serialization via `JSON.stringify(error)` producing `"{}"`

Business invite logic was fine; diagnostics were wrong.

---

## Fix

In `inviteAdminUserAction` (`src/actions/admin-directory.ts`):

1. Tag every failure with **`step`**:  
   `permissionCheck` → `createAdminClient` → `loadRole` → `inviteUserByEmail` → `profileUpdate` → `roleAssignment`
2. Extract fields **without** `JSON.stringify(error)`:

   - `name`, `message`, `code`, `status`, `error_description`, `details`
3. Reject useless messages (`"{}"`, `"[object Object]"`, empty).
4. Preserve Auth / PostgREST `code` + `status` (no blanket `APP_ERROR`).
5. Log structured diagnostics in production (no secrets).
6. Dialog shows `step`, message, code, status, description.

---

## How to read the next failure

Look for:

```txt
step=inviteUserByEmail · <message> · code=<auth_code> · status=<http>
```

or server log:

```json
{
  "message": "inviteAdminUserAction failed",
  "step": "inviteUserByEmail",
  "errorCode": "...",
  "errorStatus": 400,
  "errorMessage": "..."
}
```

That identifies the **exact** failing step and the original Auth/DB error.

---

## Files modified

| File | Change |
|------|--------|
| `src/actions/admin-directory.ts` | Step-tagged fail + Auth field extraction |
| `src/presentation/features/admin/UsersAdminClient.tsx` | Display step + Auth fields |
| `docs/INVITE_USER_ROOT_CAUSE.md` | This report |
