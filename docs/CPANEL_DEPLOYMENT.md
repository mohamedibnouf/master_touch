# cPanel Passenger Deployment — Master Touch

Production target: **cPanel VPS · Node.js 20 · Phusion Passenger · Next.js 16 (Webpack + standalone)**

---

## Folder structure (after deploy)

```
/home/USER/app/                     ← Application root (Passenger)
├── server.js                       ← Passenger startup file (required)
├── package.json
├── next.config.mjs
├── .env                            ← production secrets (never commit)
├── public/
├── scripts/
│   ├── deploy-cpanel.sh
│   └── postbuild-standalone.mjs
└── .next/
    ├── static/                     ← build output
    └── standalone/
        ├── server.js               ← Next standalone server
        ├── public/                 ← copied by deploy/postbuild
        ├── .next/
        │   └── static/             ← copied by deploy/postbuild
        └── node_modules/           ← traced production deps only
```

---

## Required environment variables

Set these in cPanel → **Setup Node.js App** → Environment variables  
(or a root `.env` / `.env.production` loaded by your host — do **not** commit secrets).

| Variable | Required | Notes |
|----------|----------|--------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Passenger sets this — do not hardcode |
| `HOSTNAME` | Recommended | `0.0.0.0` (root `server.js` enforces this) |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical HTTPS origin, e.g. `https://www.mastertouchksa.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Runtime |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Runtime (admin/CMS) |
| `UPSTASH_REDIS_REST_URL` | Yes | Runtime (rate limit) |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Runtime |
| `SENTRY_DSN` | Optional | Monitoring |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Optional | Default `ar` |

Missing Supabase/Upstash **does not crash the build**. They are required at **runtime** (health returns `degraded` / HTTP 503 until set).

---

## Passenger startup

1. cPanel → **Setup Node.js App**
2. **Node.js version:** `20.x`
3. **Application root:** path to this project
4. **Application URL:** your domain / subdomain
5. **Application startup file:** `server.js`
6. **Application mode:** Production
7. Add env vars (table above)
8. Click **Run NPM Install** (or SSH install)
9. Build & assemble assets (see below)
10. **Restart** the app

Root `server.js`:

- Sets `NODE_ENV=production` if unset
- Forces `HOSTNAME=0.0.0.0` (never binds localhost-only)
- Honors Passenger `PORT`
- Boots `.next/standalone/server.js`

---

## How to deploy (first time)

### Option A — SSH (recommended)

```bash
cd /home/USER/app
git clone <YOUR_REPO_URL> .
# or upload release zip and extract

cp .env.example .env
# edit .env with real production values

bash scripts/deploy-cpanel.sh
# runs: npm install --include=dev → npm run build → copies static + public into standalone
# IMPORTANT: uses --include=dev so Tailwind/TypeScript install even if NODE_ENV=production

# In cPanel Node.js App: Restart
```

### Option B — stepwise

```bash
npm install
npm run build          # also runs postbuild-standalone (copies assets)
npm run start          # node server.js
```

Verify:

```bash
curl -sS http://127.0.0.1:$PORT/api/health
```

Expect `"status":"healthy"` when Supabase + Upstash env vars are correct.

---

## How to update

```bash
cd /home/USER/app
git pull                 # or upload new files
bash scripts/deploy-cpanel.sh
# Restart Node.js app in cPanel
```

Keep `.env` untouched across updates.

---

## How to restart

- **cPanel:** Setup Node.js App → **Restart**
- **SSH (if using a process manager):** restart the Node app / Passenger touch:
  ```bash
  mkdir -p tmp && touch tmp/restart.txt
  ```
  (Passenger often watches `tmp/restart.txt`)

---

## How to rollback

1. Keep the previous release as a sibling folder or git tag:
   ```bash
   git tag -l
   git checkout <previous-good-tag>
   bash scripts/deploy-cpanel.sh
   ```
2. Or restore a backup of the whole application directory **including** `.env` and `.next/standalone`.
3. Restart Passenger.

Suggested habit: tag every production deploy (`v0.1.0`, `v0.1.1`, …).

---

## Health check

`GET /api/health`

Returns:

- `status` — `healthy` | `degraded`
- `database` / `checks.database` — Supabase
- `redis` / `checks.redis` — Upstash
- `environment` — `nodeEnv`, Node version, hostname, port
- `build.version` / `version` — package version
- `build.id` — Next `BUILD_ID`
- `uptime` — process uptime (seconds)

Use this URL in uptime monitors after go-live.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing .next/standalone/server.js` | Run `bash scripts/deploy-cpanel.sh` |
| CSS/JS 404 | Ensure `.next/static` was copied into standalone (postbuild / deploy script) |
| Images from `/images/...` 404 | Ensure `public/` copied into standalone |
| WebAssembly / Turbopack OOM on build | Confirm `npm run build` = `next build --webpack` and `next.config.mjs` exists |
| Health `degraded` | Check Supabase + Upstash env vars |
| App only works on localhost | Confirm startup file is root `server.js` (sets `HOSTNAME=0.0.0.0`) |

---

## Security notes

- Never commit `.env` / `.env.local` / service role keys
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only
- Prefer HTTPS canonical `NEXT_PUBLIC_APP_URL`
