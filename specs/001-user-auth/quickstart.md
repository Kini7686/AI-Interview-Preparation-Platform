# Quickstart: Validate User Authentication

Prove FR/SC outcomes without dumping full implementation. See [data-model.md](./data-model.md) and [contracts/](./contracts/).

## Prerequisites

- Node 20+, PostgreSQL reachable via `DATABASE_URL`
- Filled `.env` from `.env.example` (`AUTH_SECRET`, Google, Resend, `AUTH_URL`)
- Dependencies installed; Prisma migrated (`npx prisma migrate dev`)

## Setup

```bash
cp .env.example .env   # fill secrets locally — never commit
npm install
npx prisma migrate dev
npm run dev
```

## Automated checks

```bash
# Domain / ownership helpers (Vitest)
npm test                 # or: npx vitest run

# Auth E2E (Playwright) — configure baseURL to local app
npx playwright test e2e/auth.spec.ts
```

### Expected Vitest outcomes

- `normalizeEmail` cases pass
- `assertOwned` match vs mismatch pass

### Expected Playwright outcomes

1. Unauthenticated `GET /dashboard` → lands on sign-in (SC-002)
2. Successful sign-in (test strategy: magic-link intercept or documented Google test user) → `/dashboard` shows identity (SC-001 partial)
3. Sign-out → `/dashboard` again requires sign-in (SC-004)
4. At least one auth failure shows safe message without stack/secrets (FR-012)

## Manual smoke (optional)

1. Open `/` → `/sign-in`
2. Request magic link with a real inbox OR complete Google consent
3. Confirm dashboard shows email/name and sign-out
4. Open `/profile` and `/history` while signed in (stubs OK)
5. Sign out; confirm private URLs redirect

## Traceability

| Check | Spec |
|-------|------|
| Both methods available on sign-in UI | FR-001, FR-002 |
| Session-only sign-out | FR-003 |
| Dashboard identity + sign-out | FR-005 |
| Private redirect + callbackUrl | FR-006, FR-007 |
| Ownership helper tests | FR-010, FR-011 |
| E2E critical path | FR-016, SC-006 |
