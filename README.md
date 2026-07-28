# AI Interview Preparation Platform

Web app for **text-based mock interview practice**: sign in, set a target role, upload/edit a resume summary, run a turn-based interview, get a scored report, and review history.

Planned and delivered with **BMAD Method** + **GitHub Spec Kit**. Product requirements live under `_bmad-output/`; Spec Kit feature work under `specs/` and `.specify/`.

## Features (current)

| Area | What you get |
|------|----------------|
| **Auth** | Google OAuth + Resend magic link (Auth.js), database sessions (30 days) |
| **Profile** | Display name + default target role |
| **Resume** | PDF/DOCX upload + editable summary (required before interview) |
| **Interview** | Configure duration / question count / mix → answer turns → report |
| **History** | Past sessions and reports |
| **Dashboard** | Setup checklist + recent interviews |

Reports currently use a **local heuristic scorer** (no paid LLM required). A production LLM adapter can replace `src/lib/ai/client.ts` later.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS 4**
- **PostgreSQL** · **Prisma 6**
- **Auth.js (next-auth v5)** · **Zod** · **Vitest** · **Playwright**

## Prerequisites

- Node.js **20+**
- PostgreSQL **15+** (local or hosted)
- Optional for sign-in:
  - **Google Cloud** OAuth client (recommended for multi-user login)
  - **Resend** API key (magic link; free tier often limited to your own inbox without a verified domain)

## Quick start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env
# Edit .env — see table below

# 3. Database
createdb ai_interview          # if needed
npx prisma migrate dev
npm run db:seed                # role catalog

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy from [`.env.example`](.env.example). **Never commit `.env`.**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | App origin (`http://localhost:3000` locally) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth Web client |
| `AUTH_RESEND_KEY` / `EMAIL_FROM` | Magic-link email via Resend |

**Google OAuth (local):**

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- While the consent screen is **Testing**, add Gmail accounts under **Test users**

**Resend note:** With `onboarding@resend.dev`, delivery is often limited to your Resend account email. For any user’s inbox, verify your own domain—or use Google sign-in.

## App routes

| Path | Access |
|------|--------|
| `/` | Public home |
| `/sign-in` | Sign in (Google + email link) |
| `/dashboard` | Private hub |
| `/profile` | Profile + default role |
| `/resume` | Upload + summary |
| `/interview` | Start a mock |
| `/interview/[id]` | Active session |
| `/interview/[id]/report` | Scores + transcript |
| `/history` | Past interviews |

## Scripts

```bash
npm run dev          # local server
npm run build        # production build
npm run start        # serve production build
npm run lint         # ESLint
npm test             # Vitest
npm run test:e2e     # Playwright
npm run db:migrate   # Prisma migrate
npm run db:seed      # seed role catalog
```

Auth feature validation notes: [`specs/001-user-auth/quickstart.md`](specs/001-user-auth/quickstart.md).

## Project layout

```text
src/app/                 # App Router pages (auth + private app shell)
src/components/          # Shared UI
src/lib/auth/            # Auth.js, session/ownership helpers
src/lib/ai/              # Report generation facade
src/lib/storage/         # Local resume file storage
src/server/actions/      # Server Actions
prisma/                  # Schema, migrations, seed
specs/                   # Spec Kit features
_bmad-output/            # Brief, PRD, architecture, stories
.specify/                # Constitution + Spec Kit tooling
```

## Governance & planning

- Constitution: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
- Agent rules: [`_bmad-output/project-context.md`](_bmad-output/project-context.md)
- PRD: [`_bmad-output/planning-artifacts/prds/`](_bmad-output/planning-artifacts/prds/)
- Architecture spine: [`_bmad-output/planning-artifacts/architecture/`](_bmad-output/planning-artifacts/architecture/)

## Deploy (e.g. Vercel)

Yes, this can run on Vercel with:

1. Hosted Postgres (`DATABASE_URL`)
2. Same Auth/env vars (`AUTH_URL` = your production URL)
3. Google redirect URI updated for production
4. Resume storage moved off local `/uploads` (e.g. Vercel Blob / S3) for durable files

Local disk under `uploads/` works on your machine only.

## License

Private project (`package.json` → `"private": true`).
