# Developer Guide — Phase 1.5

## Prerequisites

- Node 22+
- Supabase project + migrations/seeds applied
- Upstash Redis database

```bash
cp .env.example .env.local
# fill Supabase + Upstash
npm install
npm run dev
```

## Commands

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Vitest |
| `npm run test:e2e` | Playwright |

## Architecture rules

1. Never add demo fallbacks for CMS content  
2. Every privileged Server Action starts with `await requirePermission(...)`  
3. Validate with Zod; sanitize user text  
4. Prefer Server Components; mark client only when needed  
5. Log via `logger`; audit via `writeAuditLog`  

## First Super Admin

1. Create Auth user in Supabase  
2. `SELECT public.assign_super_admin('<uuid>');`  
3. Sign in at `/ar/login`
