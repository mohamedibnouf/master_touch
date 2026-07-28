# Master Touch — Setup Guide (Phase 1.5)

Demo mode has been **removed**. Supabase + Upstash are required.

## 1. Create infrastructure

1. Supabase project  
2. Upstash Redis database  

## 2. Configure env

```bash
cp .env.example .env.local
```

Fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_APP_URL`

## 3. Database

Run migrations `00001` → `00010`, then all files under `supabase/seed/`.

Create Auth user and:

```sql
SELECT public.assign_super_admin('<user-uuid>');
```

## 4. Run

```bash
npm install
npm run dev
```

- Site: `/ar`  
- Admin: `/admin` (requires login)  
- Health: `/api/health`

## 5. Quality commands

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

See also: [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md), [docs/PHASE_1_5_PRODUCTION_HARDENING.md](./docs/PHASE_1_5_PRODUCTION_HARDENING.md).
