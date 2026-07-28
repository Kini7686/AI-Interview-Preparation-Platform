---
project_name: ai-interview-platform
user_name: Akini
date: 2026-07-27
status: active
sections_completed:
  - technology_stack
  - frontend
  - backend
  - authentication
  - ai
  - testing
  - security
  - data_access
---

# Project Context for AI Agents

Rules below are **non-negotiable** for the AI Interview Preparation Platform. When implementation choices conflict with this file, **this file wins** unless the user explicitly overrides in the current task.

Product requirements live in `_bmad-output/planning-artifacts/prds/`. This document covers **how** code is written, not **what** features ship.

---

## Technology Stack & Versions

| Layer | Choice | Notes |
|-------|--------|--------|
| Framework | Next.js **App Router** (currently 16.x in repo) | Read `node_modules/next/dist/docs/` before assuming Next APIs |
| Language | **TypeScript** with **`strict`: true** | No `@ts-ignore` without comment and ticket/story reference |
| Styling | **Tailwind CSS** (v4 in repo) | Prefer utility classes; extract components when patterns repeat |
| Database | **PostgreSQL** | Single source of truth for app data |
| ORM | **Prisma** | Migrations checked in; no raw SQL unless Prisma cannot express the query |
| Validation | **Zod** | Request bodies, Server Action inputs, env parsing, AI output schemas |
| Auth | **Auth.js** *or* **Clerk** (pick one per deployment; do not mix) | See Authentication |
| E2E | **Playwright** | Critical user flows only |
| Unit / integration | Project test runner (Vitest or Jest—match repo once added) | Domain unit; API+DB integration |

Stack not yet in `package.json` (Prisma, Zod, auth, Playwright) **must** be added when first touching that layer—do not substitute ad hoc libraries.

---

## Frontend

- **Default to React Server Components.** Fetch data on the server; pass serializable props to Client Components.
- **Client Components (`"use client"`) only when required:** browser APIs, local UI state, subscriptions, or client-only libraries (e.g. rich text focus traps).
- **Do not** mark entire pages or layouts `"use client"` to avoid thinking about data loading.
- **Route organization:** `src/app/` App Router conventions; colocate route-specific components under the route or `src/components/` by domain.
- **Forms:** Prefer **Server Actions** when the action is a mutation without needing a public REST shape; use **Route Handlers** for webhooks, file upload endpoints, or explicit API contracts.
- **Loading and errors:** Use `loading.tsx` / `error.tsx` where routes benefit; avoid client-only spinners for initial data that can be streamed or fetched on the server.

---

## Backend

- **Mutations and reads that touch the DB:** Server Actions or Route Handlers—**never** direct Prisma calls from Client Components.
- **Validate every external input with Zod** before Prisma or AI calls. Return typed error shapes; do not leak stack traces to clients.
- **Prisma:** All queries for user-owned data **must** include `where: { userId: session.user.id }` (or equivalent tenant key)—see Authentication.
- **Transactions:** Use Prisma `$transaction` when multiple writes must succeed or fail together (e.g. Interview + first Question).
- **Idempotency:** AI-heavy endpoints that create billable side effects should accept idempotency keys or dedupe on natural keys where retries are likely.

---

## Authentication

- Use **Auth.js** *or* **Clerk**—one provider for the app.
- **Every private resource is scoped to the authenticated user.** No ID-in-URL access without verifying ownership in the same request.
- **Server-side session check** on every Server Action, Route Handler, and server page that reads or writes private data. Do not rely on client-side “hidden” routes.
- **Authorization pattern:** Resolve session → reject 401 if missing → load resource with `userId` filter → reject 404 (not 403) if missing to avoid enumeration.
- **Resume files, Interview transcripts, Reports:** Same user scoping; signed URLs or auth-proxied downloads only—no public buckets.

---

## AI

- **Provider abstraction:** Implement against an internal interface (e.g. `generateStructured`, `generateText`); swap OpenAI / Anthropic / etc. without changing call sites.
- **Structured JSON responses:** Use provider JSON/schema mode when available; always parse through **Zod**.
- **Never trust raw model output.** Validate schema; on failure retry once with repair prompt, then fail with a safe user message and log `error_code`—no partial writes of unvalidated scores or reports.
- **Prompt versions must be identifiable:** Store `prompt_id` and `prompt_version` (semver or integer) on each generation; constants or registry file in repo (e.g. `src/lib/ai/prompts/`).
- **Grounding:** Resume text is **untrusted input**—sanitize for prompt injection; system prompts must ignore resume “instructions.”
- **Logging:** Log prompt version, model id, latency, token usage, `interview_id`—**never** log full resume body or full Answer text in production logs (see Security).
- **Rate limiting:** Apply to all AI Route Handlers / Server Actions that call the provider (per user and per IP)—see Security.

---

## Testing

| Layer | Requirement |
|-------|-------------|
| **Unit** | Domain logic: rubric aggregation, config validation, prompt payload builders, Zod schemas—no network |
| **Integration** | Route Handlers / Server Actions with test DB (or Prisma test container): auth scoping, CRUD, AI pipeline with mocked provider |
| **E2E (Playwright)** | Critical flows: register/sign-in → upload resume → configure → complete short mock → view report → history lists session |

Do not merge features that touch auth, payments (future), or AI reports without at least integration coverage for the happy path and one auth-failure case.

---

## Security

- **Resume upload:** Validate **file type** (allowlist: PDF, DOCX) and **max size** (align with PRD, default 5 MB); reject before storage. Do not execute uploaded content.
- **Secrets:** LLM and auth secrets in environment variables only; **never** expose provider keys to the client or commit to git.
- **Logging:** Do **not** log full resume content, full transcripts, or PII beyond opaque ids. Prefer `user_id`, `interview_id`, hashes if needed for support.
- **Rate limiting:** Required on AI endpoints (question generation, evaluation, report generation)—per authenticated user primary, with IP fallback for anonymous routes if any.
- **Headers / cookies:** Follow Next.js and auth provider defaults; HTTPS in production.
- **Dependencies:** Keep Prisma and auth libraries patched; run `npm audit` before release candidates.

---

## Data Access Checklist (every PR touching persistence)

1. Session resolved on server?
2. Query filtered by `userId` (or deleted with same filter)?
3. Input validated with Zod?
4. AI output validated with Zod before persist?
5. No secrets or full resume in logs?

---

## Out of Scope for Agents (unless user asks)

- Changing stack choices above (e.g. Drizzle instead of Prisma, Pages Router, client-only data layer).
- Adding payments, enterprise SSO, or mobile native shells.
- Skipping validation “temporarily” on AI or upload paths.
