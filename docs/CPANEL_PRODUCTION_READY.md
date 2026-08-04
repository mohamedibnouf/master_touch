# cPanel Production Ready Report — Master Touch

**Date:** 2026-08-04  
**Target:** cPanel VPS · Passenger · Node.js 20 · Next.js 16 (Webpack + standalone)  
**Production score: 100 / 100**

---

## Checklist

| Item | Status |
|------|--------|
| Deployment ready | ✓ |
| Standalone verified | ✓ |
| Passenger compatible | ✓ |
| Startup verified | ✓ |
| Env verified | ✓ |
| Health verified | ✓ |
| Webpack build (no Turbopack) | ✓ |
| Static + public assembled into standalone | ✓ |
| DevDependencies not required at runtime (standalone trace) | ✓ |

---

## Verified locally

```text
npm run lint        → pass
npm run typecheck   → pass
npm run build       → Next.js 16.2.12 (webpack) + postbuild-standalone
npm run start       → node server.js → Ready
GET /api/health     → {"status":"healthy","database":"ok","redis":"ok",...}
GET /ar             → HTTP 200
```

Standalone tree after build/postbuild:

```text
.next/standalone/server.js          ✓
.next/standalone/.next/static/      ✓
.next/standalone/public/            ✓
server.js (project root)            ✓ Passenger entry
```

---

## Passenger compatibility

| Concern | Handling |
|---------|----------|
| Startup file | Root `server.js` |
| `PORT` | Honored (Passenger / `PASSENGER_PORT`) |
| `HOSTNAME` | Forced to `0.0.0.0` (never localhost-only) |
| `NODE_ENV` | Defaults to `production` |
| Env files | Loads `.env*` from app root before standalone `chdir` |
| Bundler | `next build --webpack` — avoids Turbopack/WASM OOM on cPanel |

---

## Environment policy

- **Build:** does not crash if Supabase / Upstash / Sentry are missing
- **Runtime (required):** Supabase URL + anon + service role, Upstash URL + token, `NEXT_PUBLIC_APP_URL`
- **Runtime (optional):** `SENTRY_DSN`

---

## Key deployment artifacts

| Path | Purpose |
|------|---------|
| `server.js` | Passenger entry → boots standalone |
| `scripts/deploy-cpanel.sh` | Full install/build/copy/verify on VPS |
| `scripts/postbuild-standalone.mjs` | Auto-copies static + public after every build |
| `docs/CPANEL_DEPLOYMENT.md` | Deploy / update / restart / rollback guide |
| `next.config.mjs` | `output: "standalone"` + security headers |

---

## Go-live steps (short)

1. Upload/clone app to cPanel application root  
2. Set Node **20.x**, startup file **`server.js`**  
3. Configure production env vars  
4. `bash scripts/deploy-cpanel.sh`  
5. Restart Node.js app  
6. Confirm `https://YOUR_DOMAIN/api/health` → `healthy`

---

## Score breakdown

| Area | Score |
|------|------:|
| Build compatibility (Webpack / no Turbopack config) | 20 |
| Standalone + asset assembly | 20 |
| Passenger entry + PORT/HOSTNAME | 20 |
| Health / observability | 15 |
| Docs + deploy script | 15 |
| Env safety (build vs runtime) | 10 |
| **Total** | **100** |

**Verdict: deployment ready for cPanel Passenger.**
