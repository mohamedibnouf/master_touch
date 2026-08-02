# Master Touch — Setup Guide (Phase 1.5)

Demo mode has been **removed**. Supabase + Upstash are required for full CMS/auth.

## 1. Create infrastructure

1. Supabase project  
2. Upstash Redis database  

## 2. Configure env

```bash
cp .env.example .env.local
```

Fill:

- `NEXT_PUBLIC_SUPABASE_URL` — project URL only (no `/rest/v1`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_APP_URL`

## 3. Database (Supabase CLI v2)

Install/login once:

```bash
npx supabase login
```

### Link

```bash
npx supabase link --project-ref <YOUR_PROJECT_REF>
```

### Push migrations (schema only — does not seed)

```bash
npx supabase db push
```

### Seed (data)

Seeds are configured in `supabase/config.toml`:

```toml
[db.seed]
enabled = true
sql_paths = ["./seed.sql"]
```

`supabase/seed.sql` is the **default seed entrypoint**. It is generated from modular files under `supabase/seed/` (`01` → `09`) so the CLI never relies on unsupported psql `\i` includes, and each module is applied **once**.

Rebuild the entrypoint after editing any `supabase/seed/*.sql` file:

```bash
npm run db:seed:build
```

**Remote (linked project) — apply seed SQL without wiping data:**

```bash
npm run db:seed:linked
```

Equivalent:

```bash
npm run db:seed:build
npx supabase db query --linked -f supabase/seed.sql
```

**Local — full reinit (migrations + automatic seed):**

```bash
npx supabase start
npx supabase db reset
```

`db reset` applies all migrations, then runs `[db.seed].sql_paths` (default `./seed.sql`).

Skip seeding on reset:

```bash
npx supabase db reset --no-seed
```

**Local — seed only** (DB already migrated):

```bash
npm run db:seed:local
```

### Seed module order (no duplication)

| Order | File |
|------:|------|
| 1 | `seed/01_roles_permissions.sql` |
| 2 | `seed/02_super_admin.sql` |
| 3 | `seed/03_theme_settings.sql` |
| 4 | `seed/04_translations.sql` |
| 5 | `seed/05_homepage_sections.sql` |
| 6 | `seed/06_about.sql` |
| 7 | `seed/07_services.sql` |
| 8 | `seed/08_contact.sql` |
| 9 | `seed/09_seo_defaults.sql` |

Do **not** add `./seed/*.sql` to `sql_paths` alongside `./seed.sql` — that would double-apply data.

Validate / regenerate:

```bash
npm run db:seed:build
```

### Super Admin

Create an Auth user in the Supabase Dashboard, then:

```sql
SELECT public.assign_super_admin('<user-uuid>');
```

(`assign_super_admin` is created by seed `02_super_admin.sql`.)

## 4. Run the app

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
