# Story 1.1: Account Authentication

Status: ready-for-dev

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a new user,
I want to create an account and sign in,
so that my resumes, interviews, and results remain private.

## Acceptance Criteria

1. **Given** I am a new visitor, **When** I register with an approved method (Google OAuth or email magic link), **Then** an Account is created and I am authenticated. *(FR-1, FR-3)*
2. **Given** I have an Account, **When** I sign in or sign out, **Then** my session starts or ends correctly from authenticated pages. *(FR-1, FR-2)*
3. **Given** I am unauthenticated, **When** I request a dashboard / protected app route (e.g. `/dashboard`, `/history`, `/profile`, `/interview/*`), **Then** I am redirected to sign-in with return URL preserved — never shown private data. *(FR-4)*
4. **Given** I am authenticated, **When** any private read/write runs, **Then** it is scoped to `session.user.id` only (missing foreign record → 404, not 403). *(AD-2; enables later Resume/Interview privacy)*
5. **Given** auth fails (expired magic link, OAuth error, invalid session), **When** the error is shown, **Then** the UI shows a safe generic message (no stack traces, secrets, or provider internals) and offers retry/resend where applicable. *(FR-1 failure states)*
6. **Given** this critical flow, **When** CI/local test suite runs, **Then** automated tests cover: register/sign-in happy path, sign-out, unauthenticated redirect, and at least one auth failure. *(Constitution III; project-context)*

## Tasks / Subtasks

- [ ] **T1 — Foundation packages & env** (AC: 1–6)
  - [ ] Add `next-auth@beta` (Auth.js v5), `@auth/prisma-adapter`, `prisma`, `@prisma/client`, `zod`
  - [ ] Add Playwright (+ Vitest or Jest for unit/integration — match first choice and stick to it)
  - [ ] Create `src/lib/env.ts` with Zod schema: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, magic-link email provider secrets as needed; `.env.example` only (never commit real `.env`)
- [ ] **T2 — Prisma + Auth.js models** (AC: 1, 2, 4)
  - [ ] `prisma/schema.prisma`: PostgreSQL + Auth.js models (`User`, `Account`, `Session`, `VerificationToken`) per `@auth/prisma-adapter` docs
  - [ ] `src/lib/db/prisma.ts` singleton client (server-only)
  - [ ] Initial migration; document local DB (Neon/Supabase/Docker) in story completion notes
- [ ] **T3 — Auth.js configuration** (AC: 1, 2, 5)
  - [ ] `src/lib/auth/index.ts` (or `src/auth.ts`): `NextAuth({ adapter: PrismaAdapter(prisma), providers: [Google, Email/Resend magic link], … })` exporting `{ handlers, auth, signIn, signOut }`
  - [ ] Session callback must expose stable `session.user.id`
  - [ ] Custom pages: sign-in + error (safe messages)
  - [ ] `src/app/api/auth/[...nextauth]/route.ts` → export `GET`/`POST` from `handlers`
  - [ ] `requireSession()` in `src/lib/auth/session.ts`: no session → throw/return unauthorized for Server Actions; use `auth()` in RSC/layouts
- [ ] **T4 — Auth UI (RSC + minimal client)** (AC: 1, 2, 5)
  - [ ] `src/app/(auth)/sign-in/page.tsx` — Google button + magic-link email form; keyboard-accessible; labeled inputs (Constitution V)
  - [ ] Sign-out control available from authenticated shell
  - [ ] Error query/param handling → safe user-facing copy
- [ ] **T5 — Route protection** (AC: 3, 4)
  - [ ] `src/app/(app)/layout.tsx` — `auth()`; redirect unauthenticated to `/sign-in?callbackUrl=…`
  - [ ] Stub protected routes used by FR-4: at least `/dashboard` (and preferably `/profile`, `/history` placeholders) so redirect is testable
  - [ ] Optional: `middleware.ts` / Next 16 proxy aligned with Auth.js docs — must not put Prisma in edge if unsupported; prefer Node runtime layout gate if unsure
  - [ ] Public: `/`, `(auth)/*`, `/api/auth/*`
- [ ] **T6 — Ownership helper for later stories** (AC: 4)
  - [ ] Export typed helper pattern e.g. `assertOwned(userId, session.user.id)` or document that every future query must include `userId` — implement one smoke Server Action that 401s when unauthenticated
- [ ] **T7 — Tests** (AC: 6)
  - [ ] Integration: unauthenticated private action → 401/redirect; happy-path session create (mock provider or test DB)
  - [ ] Playwright E2E: sign-in path (use Auth.js test mode / mocked OAuth or magic-link interception) → land on protected page → sign out → protected page redirects
  - [ ] Map tests to AC numbers in file comments or describe titles

## Dev Notes

### Why this story enters development first

Preferred epic shape + PRD F-01: **Epic 1 — Foundation and authentication**. No sprint-status backlog existed; BMAD selected **1.1 Account Authentication** as the first implementable slice (register/sign-in/protect routes). Profile (FR-5–7), resume, and interview are **out of scope**.

### Architecture compliance (MUST)

| AD | Rule for this story |
|----|---------------------|
| AD-1 | No Prisma / Auth secrets in Client Components |
| AD-2 | Private queries always filter `userId`; 404 not 403 |
| AD-3 | `requireSession()` / `auth()` on private entrypoints |
| AD-10 | **Auth.js v5 only** — do not add Clerk |
| AD-11 | Auth HTTP = Route Handler; form sign-in/out = Server Actions |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-ai-interview-platform-2026-07-27/ARCHITECTURE-SPINE.md`]

### Library / framework requirements

| Package | Version guidance |
|---------|------------------|
| `next` | 16.2.12 (existing) |
| `next-auth` | Auth.js v5 (`next-auth@beta` / current v5 line — pin on install) |
| `@auth/prisma-adapter` | current compatible with Auth.js v5 |
| `prisma` / `@prisma/client` | 6.x per architecture spine |
| `zod` | 3.x |
| Playwright | 1.x for E2E |

**Auth.js v5 pattern (current):**

```ts
// export { handlers, auth, signIn, signOut } = NextAuth({ adapter: PrismaAdapter(prisma), providers: [...] })
// app/api/auth/[...nextauth]/route.ts → export const { GET, POST } = handlers
```

Prefer **database sessions** with Prisma adapter for Account persistence (FR-3). Ensure `session.user.id` is set in callbacks.

Magic link: use Auth.js Email provider (e.g. Resend) — document required env in `.env.example`. If email provider cannot be configured in local MVP, Google OAuth alone MAY ship first **only if** AC1 still has one approved method and magic-link is tracked as immediate follow-up task in Completion Notes — prefer implementing both.

[Source: https://authjs.dev/getting-started/adapters/prisma]

### File structure (create)

```text
prisma/schema.prisma
prisma/migrations/
src/lib/env.ts
src/lib/db/prisma.ts
src/lib/auth/index.ts          # NextAuth config
src/lib/auth/session.ts        # requireSession
src/app/api/auth/[...nextauth]/route.ts
src/app/(auth)/sign-in/page.tsx
src/app/(app)/layout.tsx
src/app/(app)/dashboard/page.tsx   # stub protected
.env.example
tests/ or e2e/                     # Playwright + integration
```

Update root `src/app/layout.tsx` metadata/title away from “Create Next App” when touching layout.

**Do not** invent `backend/` or `frontend/` split — single Next.js app per architecture seed.

### Security & privacy (Constitution II)

- Never log emails in full if avoidable; never log `AUTH_SECRET` or tokens
- Safe error strings only in UI
- `.env*` ignored (already in `.gitignore`); commit `.env.example` only

### Testing standards

- Constitution III + project-context: auth features need integration happy path + one failure case before merge
- AC6 requires automated coverage of the critical auth flow (Playwright)
- Unit-test Zod `env` schema parse failures

### Project Structure Notes

- Today `src/app` only has `layout.tsx`, `page.tsx`, `globals.css`, favicon — greenfield auth install
- Align with architecture tree: `src/lib/auth`, `src/app/(auth)`, `src/app/(app)`, `src/lib/db`
- BMAD + Spec Kit folders stay tracked; do not commit secrets

### Previous story intelligence

None — first implementation story.

### Git intelligence

Recent work is docs/governance only (constitution, epics, gitignore). No prior auth code patterns in-repo.

### Out of scope (do not implement here)

- User Profile fields / first-login display name (F-02 / FR-5–7)
- Resume upload, interviews, AI, reports, history UI beyond stubs for route gates
- Account deletion, payments, Clerk, team SSO
- Full analytics vendor (optional: fire `account_created` / `sign_in_*` to structured logs)

### References

- PRD F-01 FR-1–FR-4 — `_bmad-output/planning-artifacts/prds/prd-ai-interview-platform-2026-07-27/prd.md`
- Architecture AD-1,2,3,10,11 — `.../ARCHITECTURE-SPINE.md`
- Project context — `_bmad-output/project-context.md`
- Constitution I–III, V, VII — `.specify/memory/constitution.md`
- Epics inventory FR1–FR4 / Epic 1 preferred — `_bmad-output/planning-artifacts/epics.md`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
