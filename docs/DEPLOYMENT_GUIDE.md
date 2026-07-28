# Deployment Guide — Phase 1

## Local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Production checklist

1. Create Supabase project
2. Run migrations `00001` → `00009`
3. Run seed SQL files
4. Create Auth user; `assign_super_admin`
5. Set Auth redirect URLs
6. Configure Storage buckets (migration creates policies)
7. Set Vercel env vars from `.env.example`
8. Deploy

## Vercel

- Framework: Next.js
- Build: `npm run build`
- Output: default
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`

## Headers

Configured in `next.config.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restricted

## Domains

Point apex + `www` to Vercel; set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS origin.
