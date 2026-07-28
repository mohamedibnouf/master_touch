# Backup & Recovery

## Database

- Use Supabase **Point-in-Time Recovery** (Pro+) or scheduled `pg_dump`
- Keep migration files in git as source of truth
- Seed files are idempotent where possible (`ON CONFLICT`)

## Storage

- Enable versioning / backups on Storage buckets for production
- Critical assets (logo, OG) also mirror in `public-assets`

## Application

- Deploy via Vercel; roll back previous deployment on failure
- Store env secrets in Vercel / secret manager — never commit `.env.local`

## Recovery checklist

1. Restore DB from backup  
2. Re-run migrations if schema ahead of backup  
3. Re-apply seeds only if content wiped  
4. Verify `/api/health`  
5. Sign in as Super Admin and spot-check CMS modules  
