# Implementation Plan: User Authentication

**Branch**: `001-user-auth` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-user-auth/spec.md`

**Note**: Aligned with architecture spine AD-1/2/3/10/11, constitution v1.0.0, and BMAD story `1-1-account-authentication`.

## Summary

Deliver register / sign-in / sign-out and a minimal private dashboard with route protection and own-data authorization. Technical approach: **Auth.js (NextAuth v5)** + **Prisma adapter** on **PostgreSQL**, **Google** as the external identity provider, **Resend** (Auth.js Email/Resend provider) for passwordless magic links, **database sessions** with **30-day** maxAge, **Zod**-validated env, **`(app)` layout** + **middleware** for coarse private-route redirects, and **`requireSession()`** for server-side ownership checks. **Vitest** for domain helpers; **Playwright** for the authentication E2E flow.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Node.js 20 LTS

**Primary Dependencies**: Next.js 16.2.12 (App Router), React 19.2.4, Auth.js (`next-auth` v5 / `@auth/*`), `@auth/prisma-adapter`, Prisma 6.x, Zod 3.x, Resend (email magic link)

**Storage**: PostgreSQL 15+ via Prisma (Auth.js `User`, `Account`, `Session`, `VerificationToken`)

**Testing**: Vitest (domain/unit + light integration with mocked session), Playwright (auth E2E)

**Target Platform**: Web (desktop-first responsive), deployable on Vercel + managed Postgres

**Project Type**: Single Next.js web application (modular monolith)

**Performance Goals**: Sign-in → private dashboard perceptible within a few seconds under normal network; SC-001 registration under 5 minutes wall-clock

**Constraints**: Secrets server-side only; no resume logging (N/A this feature); userId tenancy; no Clerk; middleware for route gates only—not for Prisma ownership queries

**Scale/Scope**: Individual accounts; MVP auth only (no MFA, teams, account deletion UI)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Source: `.specify/memory/constitution.md` (v1.0.0+)*

| Gate | Status | Plan evidence |
|------|--------|---------------|
| **I. Type Safety** | PASS | TS strict; Zod `env` + magic-link email input schemas |
| **II. Security & Privacy** | PASS | `requireSession` + `userId` filters; safe error UI; secrets in env |
| **III. Test-First** | PASS | Vitest for ownership helpers; Playwright for critical auth flow |
| **IV. AI Reliability** | N/A | Out of scope |
| **V. Accessibility** | PASS | Sign-in/dashboard keyboard, labels, focus (FR-015) |
| **VI. Simplicity** | PASS | Auth.js + Prisma only; deps justified in Complexity Tracking |
| **VII. Traceability** | PASS | FR/SC mapped in research, contracts, quickstart; tasks via `/speckit-tasks` |

**Post-Phase 1 re-check**: Still PASS — data model enforces email uniqueness; contracts define auth routes and error shapes; quickstart validates ACs.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth-http.md
│   └── session-ownership.md
└── tasks.md                 # via /speckit-tasks (not this command)
```

### Source Code (repository root)

```text
prisma/
  schema.prisma
  migrations/
src/
  app/
    layout.tsx                 # UPDATE: metadata/title
    page.tsx                   # public home
    (auth)/
      sign-in/page.tsx         # NEW
      error/page.tsx           # NEW (safe Auth.js errors)
    (app)/
      layout.tsx               # NEW: auth() gate
      dashboard/page.tsx       # NEW: identity + sign-out
      profile/page.tsx         # NEW: stub private (redirect target)
      history/page.tsx         # NEW: stub private
    api/auth/[...nextauth]/route.ts  # NEW
  lib/
    env.ts                     # NEW: Zod env
    db/prisma.ts               # NEW: Prisma singleton
    auth/
      index.ts                 # NEW: NextAuth config
      session.ts               # NEW: requireSession, assertOwned
      errors.ts                # NEW: safe error mapping
    domain/
      email.ts                 # NEW: normalizeEmail (Vitest)
    validation/
      auth.schema.ts           # NEW: email form Zod
  middleware.ts                # NEW: matcher for private prefixes
  server/actions/
    auth.ts                    # NEW: signOut / requestMagicLink actions
tests/
  unit/
    email.test.ts
    assert-owned.test.ts
e2e/
  auth.spec.ts                 # Playwright
.env.example                   # NEW
vitest.config.ts               # NEW
playwright.config.ts           # NEW
```

**Structure Decision**: Single Next.js App Router project per architecture seed (`src/app`, `src/lib/{auth,db,domain,validation}`, `src/server/actions`). No separate `backend/` / `frontend/` packages.

## Files to create or modify

| Path | Action | Purpose |
|------|--------|---------|
| `package.json` | MODIFY | Add auth, prisma, zod, vitest, playwright, resend |
| `prisma/schema.prisma` | CREATE | Auth.js models + PostgreSQL |
| `prisma/migrations/*` | CREATE | Initial auth migration |
| `src/lib/env.ts` | CREATE | Zod env validation |
| `src/lib/db/prisma.ts` | CREATE | Prisma client |
| `src/lib/auth/index.ts` | CREATE | Auth.js config (Google + Resend, adapter, session) |
| `src/lib/auth/session.ts` | CREATE | `requireSession`, `assertOwned` |
| `src/lib/auth/errors.ts` | CREATE | Map Auth.js errors → safe UI copy |
| `src/lib/domain/email.ts` | CREATE | Case-insensitive email normalize |
| `src/lib/validation/auth.schema.ts` | CREATE | Magic-link email Zod schema |
| `src/app/api/auth/[...nextauth]/route.ts` | CREATE | Auth.js handlers |
| `src/app/(auth)/sign-in/page.tsx` | CREATE | Sign-in UI |
| `src/app/(auth)/error/page.tsx` | CREATE | Safe error page |
| `src/app/(app)/layout.tsx` | CREATE | Server `auth()` redirect |
| `src/app/(app)/dashboard/page.tsx` | CREATE | Minimal private home |
| `src/app/(app)/profile/page.tsx` | CREATE | Stub private route |
| `src/app/(app)/history/page.tsx` | CREATE | Stub private route |
| `src/middleware.ts` | CREATE | Coarse protection for `/dashboard`, `/profile`, `/history`, `/interview` |
| `src/server/actions/auth.ts` | CREATE | Sign-out + magic-link request |
| `src/app/layout.tsx` | MODIFY | Product title/metadata |
| `.env.example` | CREATE | Documented env vars |
| `vitest.config.ts`, `playwright.config.ts` | CREATE | Test runners |
| `tests/unit/*`, `e2e/auth.spec.ts` | CREATE | Test strategy artifacts |

## Authentication configuration

- **Library**: Auth.js v5 (`next-auth`) with `PrismaAdapter`
- **Providers**: `Google` + `Resend` (passwordless email)
- **Account linking**: Same normalized email → same `User` (`allowDangerousEmailAccountLinking: true` only with email verified by provider; document risk in research)
- **Session**: `strategy: "database"`; `maxAge: 30 * 24 * 60 * 60` (30 days idle/max)
- **Callbacks**: `session` callback sets `session.user.id` from DB user
- **Pages**: `signIn: "/sign-in"`, `error: "/sign-in"` or `/error` with safe mapping
- **Exports**: `{ handlers, auth, signIn, signOut }` from `src/lib/auth`

## Database changes

- Add Prisma schema with Auth.js required models (`User`, `Account`, `Session`, `VerificationToken`)
- Unique `User.email` (store normalized lowercase)
- UUID or cuid IDs per Auth.js/Prisma adapter defaults (prefer adapter-compatible IDs)
- Initial migration applied before running app
- No application Profile/Resume tables in this feature (stubs only)

## Route protection

1. **`middleware.ts`**: Match `/dashboard/:path*`, `/profile/:path*`, `/history/:path*`, `/interview/:path*` — if no session token/cookie, redirect to `/sign-in?callbackUrl=…`. Do **not** run Prisma ownership logic in middleware.
2. **`(app)/layout.tsx`**: Call `auth()`; if null, redirect to sign-in (defense in depth).
3. **Public**: `/`, `/(auth)/*`, `/api/auth/*`

## User ownership enforcement

- `requireSession()` on every private Server Action / private Route Handler → 401 if missing
- `assertOwned(resourceUserId, session.user.id)` → throw not-found (map to 404) if mismatch
- Future entities MUST query with `where: { userId: session.user.id }` (AD-2)
- Stub routes have no cross-user IDs yet; unit-test `assertOwned` for Story 4 readiness

## Error handling

- UI: generic messages via `errors.ts` (`Configuration`, `AccessDenied`, `Verification`, `Default`)
- Never expose stack traces, `AUTH_SECRET`, or provider raw payloads
- Magic-link expired → message + CTA to request new link (FR-013)
- Structured server logs: `error_code`, optional `userId` — never tokens or magic-link URLs in full

## Test strategy

| Layer | Tool | Covers |
|-------|------|--------|
| Domain | Vitest | `normalizeEmail`, `assertOwned` |
| Integration (optional light) | Vitest + mocked `auth()` | unauthenticated action → unauthorized |
| E2E | Playwright | Sign-in (Google test mode or magic-link intercept), dashboard identity, sign-out, unauthenticated `/dashboard` redirect, one failure path |

Map tests to FR-001–016 / SC-001–007 in describe titles.

## Environment variables

Document in `.env.example` (values never committed):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `AUTH_SECRET` | Auth.js secret |
| `AUTH_URL` / `NEXTAUTH_URL` | App origin for callbacks |
| `AUTH_GOOGLE_ID` | Google OAuth client id |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_RESEND_KEY` | Resend API key for magic links |
| `EMAIL_FROM` | From address for magic links |

Validated by `src/lib/env.ts` (Zod) at server startup / first import.

## Complexity Tracking

| Dependency / choice | Why Needed | Simpler Alternative Rejected Because |
|---------------------|------------|-------------------------------------|
| Auth.js + Prisma adapter | AD-10; Account/Session persistence | Custom auth reinvented; Clerk forbidden concurrently |
| Google + Resend | Spec requires both method classes | Single method fails clarified FR-001/002 |
| Middleware + layout `auth()` | Coarse UX redirect + server gate | Middleware-only insufficient for Server Actions |
| Vitest + Playwright | Constitution III; user-requested | Manual QA only insufficient for AC6/FR-016 |
| Zod | Constitution I; env + form boundaries | Ad-hoc validation drifts |
