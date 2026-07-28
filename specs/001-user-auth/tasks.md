---
description: "Task list for User Authentication (001-user-auth)"
---

# Tasks: User Authentication

**Input**: Design documents from `/specs/001-user-auth/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED (constitution III + plan + user request: Vitest integration + Playwright). Write failing tests before or with implementation; map to FR/AC IDs.

**Organization**: Grouped by user story (US1–US5). User themes mapped: Auth.js config → Phase 2; Prisma models → Phase 2; providers → Phase 2/US1; sign-in UI → US1; sign-out → US2; dashboard → US1; server authz → US3/US4; integration tests → per story; Playwright → US1–US3 polish; env docs → Phase 1 + Polish.

**BMAD story**: `_bmad-output/implementation-artifacts/1-1-account-authentication.md`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different files, no incomplete blockers)
- **[USn]**: User story label (story phases only)
- Every task includes a concrete file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, test runners, env documentation skeleton

- [X] T001 Add Auth.js, Prisma, Zod, Resend dependencies to `package.json` and install (`next-auth`, `@auth/prisma-adapter`, `prisma`, `@prisma/client`, `zod`, `resend`)
- [X] T002 [P] Add Vitest and Playwright deps plus scripts in `package.json` (`vitest`, `@playwright/test`, test scripts)
- [X] T003 [P] Create `vitest.config.ts` with path alias `@/*` → `src/*`
- [X] T004 [P] Create `playwright.config.ts` with `baseURL` for local app and `e2e/` testDir
- [X] T005 Create `.env.example` documenting `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_RESEND_KEY`, `EMAIL_FROM` (no real secrets)
- [X] T006 [P] Update product metadata title/description in `src/app/layout.tsx`

**Checkpoint**: Tooling and env template ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prisma Auth models, Auth.js core, env validation, session helpers — MUST complete before user-story UI

**⚠️ CRITICAL**: No user story UI work until this phase completes

- [X] T007 Create Zod env schema and loader in `src/lib/env.ts` (FR-012 secrets server-side; Constitution I)
- [X] T008 Create Prisma singleton in `src/lib/db/prisma.ts` (server-only; AD-1)
- [X] T009 Define Auth.js `User`, `Account`, `Session`, `VerificationToken` models in `prisma/schema.prisma` per `specs/001-user-auth/data-model.md`
- [X] T010 Run initial migration generating `prisma/migrations/` against local PostgreSQL
- [X] T011 Implement Auth.js config in `src/lib/auth/index.ts`: PrismaAdapter, Google + Resend providers, database sessions `maxAge` 30 days, session callback with `user.id`, pages signIn/error (FR-001, FR-002, FR-008; research R1–R4)
- [X] T012 Export Auth.js route handlers in `src/app/api/auth/[...nextauth]/route.ts`
- [X] T013 [P] Implement `normalizeEmail` in `src/lib/domain/email.ts` (FR-004)
- [X] T014 [P] Implement safe Auth.js error mapping in `src/lib/auth/errors.ts` (FR-012, FR-013)
- [X] T015 Implement `requireSession` and `assertOwned` in `src/lib/auth/session.ts` per `specs/001-user-auth/contracts/session-ownership.md` (FR-009, FR-010, FR-011; AD-2/AD-3)
- [X] T016 [P] Add magic-link email Zod schema in `src/lib/validation/auth.schema.ts` (FR-001)
- [X] T017 Create Server Actions `requestMagicLink` and `signOutAction` in `src/server/actions/auth.ts` (FR-002, FR-003)

**Checkpoint**: Auth backend + DB ready; providers configured; helpers available

---

## Phase 3: User Story 1 — Register and reach private dashboard (Priority: P1) 🎯 MVP

**Goal**: Visitor registers via Google or magic link, lands on minimal dashboard with identity + sign-out (FR-001, FR-004, FR-005)

**Independent Test**: Complete registration as first-time user; dashboard shows name/email and sign-out

### Tests for User Story 1 (REQUIRED — Constitution III)

> Write failing tests first; map to US1 AC1–AC3 / FR-001 / FR-005 / SC-001

- [X] T018 [P] [US1] Add Vitest unit tests for `normalizeEmail` in `tests/unit/email.test.ts` (FR-004)
- [X] T019 [P] [US1] Add Playwright sketch (failing) for register→dashboard identity in `e2e/auth.spec.ts` (SC-001, FR-016)

### Implementation for User Story 1

- [X] T020 [US1] Build sign-in page with Google button + email magic-link form in `src/app/(auth)/sign-in/page.tsx` (FR-001, FR-002, FR-015)
- [X] T021 [P] [US1] Build safe auth error page in `src/app/(auth)/error/page.tsx` (FR-012, FR-013)
- [X] T022 [US1] Create authenticated shell layout with `auth()` redirect in `src/app/(app)/layout.tsx` (FR-006)
- [X] T023 [US1] Create minimal private dashboard (identity + sign-out) in `src/app/(app)/dashboard/page.tsx` (FR-005)
- [X] T024 [US1] Wire account linking / email uniqueness behavior via Auth.js config + `normalizeEmail` usage in `src/lib/auth/index.ts` (FR-004)
- [X] T025 [US1] Ensure already-authenticated users hitting `/sign-in` redirect to `/dashboard` in `src/app/(auth)/sign-in/page.tsx` (edge case)

**Checkpoint**: US1 independently testable — register and see private home

---

## Phase 4: User Story 2 — Sign in and sign out (Priority: P1)

**Goal**: Returning users sign in; sign-out ends **this session only** (FR-002, FR-003, SC-004)

**Independent Test**: Sign in → dashboard → sign out → `/dashboard` requires sign-in again

### Tests for User Story 2 (REQUIRED)

- [X] T026 [P] [US2] Extend Playwright in `e2e/auth.spec.ts` for sign-out then blocked dashboard (FR-003, SC-004)
- [X] T027 [P] [US2] Add integration-style Vitest for `signOutAction` / session absence in `tests/unit/session.test.ts` (mock `auth`) (FR-003, FR-009)

### Implementation for User Story 2

- [X] T028 [US2] Confirm `signOutAction` deletes only current session via Auth.js `signOut` in `src/server/actions/auth.ts` (FR-003)
- [X] T029 [US2] Expose accessible sign-out control on dashboard using action in `src/app/(app)/dashboard/page.tsx` (FR-003, FR-015)
- [X] T030 [US2] After sign-out redirect to `/` or `/sign-in` per `specs/001-user-auth/contracts/auth-http.md` in `src/server/actions/auth.ts`

**Checkpoint**: US2 independently testable — session start/stop on one device

---

## Phase 5: User Story 3 — Protect private routes (Priority: P1)

**Goal**: Unauthenticated private routes redirect to sign-in with `callbackUrl`; public pages stay open (FR-006, FR-007, FR-014)

**Independent Test**: Signed-out visit `/dashboard`, `/profile`, `/history` → sign-in; after sign-in return to intended private path when valid

### Tests for User Story 3 (REQUIRED)

- [X] T031 [P] [US3] Playwright: unauthenticated `/dashboard` and `/profile` redirect to sign-in with callback in `e2e/auth.spec.ts` (FR-006, SC-002)
- [X] T032 [P] [US3] Playwright: after sign-in, valid `callbackUrl` honored; invalid → `/dashboard` in `e2e/auth.spec.ts` (FR-007)

### Implementation for User Story 3

- [X] T033 [US3] Add coarse route protection middleware for `/dashboard`, `/profile`, `/history`, `/interview` in `src/middleware.ts` (FR-006; research R5)
- [X] T034 [P] [US3] Add stub private page `src/app/(app)/profile/page.tsx` (FR-006)
- [X] T035 [P] [US3] Add stub private page `src/app/(app)/history/page.tsx` (FR-006)
- [X] T036 [US3] Validate `callbackUrl` allowlist (private prefixes only) in `src/lib/auth/index.ts` or `src/lib/auth/callback-url.ts` (FR-007)
- [X] T037 [US3] Verify public `/` and `/sign-in` remain accessible without session in `src/app/page.tsx` / `(auth)/sign-in/page.tsx` (FR-014)

**Checkpoint**: US3 independently testable — redirects and return URL

---

## Phase 6: User Story 4 — Own-data authorization (Priority: P1)

**Goal**: Server-side ownership enforcement; cross-user access → not-found (FR-010, FR-011, FR-009)

**Independent Test**: `assertOwned` / mocked private action: match OK; mismatch 404; no session 401

### Tests for User Story 4 (REQUIRED)

- [X] T038 [P] [US4] Vitest `assertOwned` match/mismatch in `tests/unit/assert-owned.test.ts` (FR-010, FR-011)
- [X] T039 [P] [US4] Vitest `requireSession` null vs session in `tests/unit/session.test.ts` (FR-009) — merge with T027 if preferred
- [X] T040 [US4] Integration test: sample Server Action rejects unauthenticated caller in `tests/integration/require-session.test.ts` (FR-009; user theme #8)

### Implementation for User Story 4

- [X] T041 [US4] Add demo/private probe Server Action using `requireSession` + `assertOwned` in `src/server/actions/ownership-probe.ts` (for tests; no cross-user data UI yet) (FR-010, FR-011)
- [X] T042 [US4] Document ownership pattern comment/helper export from `src/lib/auth/session.ts` for future Resume/Interview queries (AD-2)

**Checkpoint**: US4 independently testable via unit/integration without resume feature

---

## Phase 7: User Story 5 — Accessible auth experience (Priority: P2)

**Goal**: Keyboard, labels, focus, perceivable errors on auth UI (FR-015, SC-005)

**Independent Test**: Keyboard-only traverse sign-in; labeled email field; error text associated

### Tests for User Story 5 (REQUIRED)

- [X] T043 [P] [US5] Playwright a11y smoke: tab order / visible focus on `src/app/(auth)/sign-in/page.tsx` via `e2e/auth-a11y.spec.ts` (FR-015, SC-005)

### Implementation for User Story 5

- [X] T044 [US5] Ensure semantic form labels, button names, and focus styles on `src/app/(auth)/sign-in/page.tsx` (FR-015)
- [X] T045 [P] [US5] Ensure dashboard sign-out control is keyboard reachable in `src/app/(app)/dashboard/page.tsx` (FR-015)
- [X] T046 [US5] Associate auth error messages with form/region in `src/app/(auth)/sign-in/page.tsx` and `src/app/(auth)/error/page.tsx` (FR-012, FR-015)

**Checkpoint**: US5 independently testable — a11y smoke passes

---

## Phase 8: Polish & Cross-Cutting

**Purpose**: Env docs, E2E consolidation, quickstart alignment

- [X] T047 Finalize `.env.example` comments to match `specs/001-user-auth/plan.md` env table and `specs/001-user-auth/quickstart.md`
- [X] T048 [P] Add npm scripts `test`, `test:e2e` in `package.json` if missing
- [X] T049 Consolidate Playwright auth coverage (happy path, failure, redirect, sign-out) in `e2e/auth.spec.ts` (FR-016, SC-006)
- [X] T050 [P] Update `README.md` with auth local setup pointer to `specs/001-user-auth/quickstart.md`
- [X] T051 Verify no secrets committed; confirm `.gitignore` still ignores `.env*` except `.env.example`

---

## Dependencies & Story Order

```text
Phase 1 Setup → Phase 2 Foundational
                    ↓
         US1 (MVP: register + dashboard)
                    ↓
         US2 (sign-out) ── can overlap UI polish with US1 after T023
                    ↓
         US3 (middleware + stubs) ── needs US1 dashboard + sign-in
                    ↓
         US4 (ownership helpers/tests) ── needs T015 from Phase 2; parallelizable after Phase 2
                    ↓
         US5 (a11y) ── after sign-in/dashboard UI exist
                    ↓
         Phase 8 Polish
```

- **US4** domain tests (T038–T039) MAY start right after T015 (parallel with US1 UI)
- **US3** middleware needs private routes from US1 stubs/dashboard

## Parallel Opportunities

- After T006: T003/T004 already [P]; Phase 2: T013/T014/T016 [P]
- US1: T018/T019 [P]; T021 [P] with T020 careful sequencing
- US3: T034/T035 [P]
- US4: T038/T039 [P]
- Polish: T048/T050 [P]

## Implementation Strategy

1. **MVP**: Complete Phase 1–2 + **US1** (themes 1–4, 6 partially) → demo register → dashboard
2. **Increment**: US2 sign-out → US3 redirects → US4 ownership tests → US5 a11y → Polish (themes 5, 7–10)
3. Prefer failing tests first within each story phase

## User theme → task map

| # | Theme | Primary tasks |
|---|--------|----------------|
| 1 | Install/configure Auth.js | T001, T011, T012 |
| 2 | Prisma user/account/session | T008–T010 |
| 3 | Configure providers | T011 |
| 4 | Sign-in interface | T020, T021, T044 |
| 5 | Sign-out action | T017, T028–T030 |
| 6 | Private dashboard | T022, T023 |
| 7 | Server-side authorization | T015, T033, T041–T042 |
| 8 | Integration tests | T027, T039, T040 |
| 9 | Playwright auth tests | T019, T026, T031–T032, T049 |
| 10 | Environment documentation | T005, T007, T047 |

## Format validation

All tasks use `- [ ]`, sequential `Tnnn`, optional `[P]`, story `[USn]` on story phases only, and include file paths.
