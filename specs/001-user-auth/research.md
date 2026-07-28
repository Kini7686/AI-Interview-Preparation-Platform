# Research: User Authentication (001-user-auth)

## R1 — Auth library

- **Decision**: Auth.js v5 (`next-auth`) with `@auth/prisma-adapter`
- **Rationale**: Architecture AD-10; App Router–native; Prisma persistence for Accounts/Sessions; matches BMAD story
- **Alternatives considered**: Clerk (forbidden concurrent with Auth.js for MVP); custom JWT auth (higher risk, more code); Lucia (extra learning, not in spine)

## R2 — Session strategy

- **Decision**: Database sessions via Prisma adapter; `maxAge` = 30 days
- **Rationale**: Spec clarification (30-day idle); sign-out this session only maps cleanly to deleting one `Session` row
- **Alternatives considered**: JWT-only sessions (harder “sign out this device” semantics and weaker server revocation)

## R3 — Identity providers

- **Decision**: Google OAuth + Resend passwordless email
- **Rationale**: Spec requires both method classes; Google is standard for SWE candidates; Resend integrates with Auth.js Email/Resend provider
- **Alternatives considered**: GitHub-only (less “candidate” affinity); SMTP nodemailer (more ops); magic-link deferred (fails clarification)

## R4 — Email → one Account

- **Decision**: Normalize email to lowercase trim; unique `User.email`; enable careful account linking when providers share verified email
- **Rationale**: Spec FR-004 / clarification “one Account per email”
- **Alternatives considered**: Separate accounts per provider (rejected by clarification); manual link-only UX (out of MVP scope)

## R5 — Route protection split

- **Decision**: Middleware for coarse private-prefix redirect; `(app)/layout.tsx` `auth()` for defense in depth; `requireSession` for mutations
- **Rationale**: User asked for middleware only where appropriate; Prisma ownership must stay on Node/server (AD-1/2)
- **Alternatives considered**: Middleware-only (insufficient for Server Actions); layout-only (weaker early redirect UX)

## R6 — Middleware vs Next.js 16

- **Decision**: Use `src/middleware.ts` with Auth.js session cookie check / `auth` wrapper per current Auth.js Next.js docs; keep Prisma out of middleware
- **Rationale**: Next 16 may introduce `proxy` patterns—verify against installed `next` docs at implement time; if edge constraints block Auth.js helper, fall back to layout-only gate and document in story completion notes
- **Alternatives considered**: Always layout-only (acceptable fallback)

## R7 — Testing stack

- **Decision**: Vitest for domain; Playwright for auth E2E
- **Rationale**: User mandate; constitution III; Playwright already in architecture spine
- **Alternatives considered**: Jest (fine but user specified Vitest); Cypress (heavier, not in spine)

## R8 — Error UX

- **Decision**: Central `mapAuthError(code)` → safe strings; Auth.js `pages.error` → product error/sign-in page
- **Rationale**: FR-012/013; constitution II
- **Alternatives considered**: Raw Auth.js error query params in UI (leaky / confusing)
