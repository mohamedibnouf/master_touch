# Master Touch

Enterprise multilingual corporate website and CMS for **Master Touch** (ماستر تاتش) — electromechanical works, architectural finishing, smart solutions, and O&M in Saudi Arabia.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · next-intl · Supabase · Framer Motion · TanStack · Chart.js · Zod · React Hook Form

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000/ar](http://localhost:3000/ar) and [http://localhost:3000/admin](http://localhost:3000/admin).

Full setup (migrations, seeds, Supabase): see [SETUP.md](./SETUP.md).

Architecture & audit docs: see [docs/](./docs/) — start with [PHASE1_AUDIT_REPORT.md](./docs/PHASE1_AUDIT_REPORT.md).

## Phase 1 status

- Public: Home, About, Services, Contact, Auth (login / forgot / reset), 404
- Admin: Dashboard, Users, Roles, Homepage, About, Services, Contact, Media, Theme, Translations, Settings, Profile
- Database: complete Phase 1 schema, RLS, storage buckets, profile-based seeds
- Demo mode runs without Supabase credentials
