---
stepsCompleted: ['step-01-validate-prerequisites']
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-ai-interview-platform-2026-07-27/prd.md
  - _bmad-output/planning-artifacts/prds/prd-ai-interview-platform-2026-07-27/addendum.md
  - _bmad-output/planning-artifacts/architecture/architecture-ai-interview-platform-2026-07-27/ARCHITECTURE-SPINE.md
  - _bmad-output/project-context.md
preferredEpicShape:
  - Epic 1 — Foundation and authentication
  - Epic 2 — Resume and role setup
  - Epic 3 — Interview generation
  - Epic 4 — Evaluation and feedback
  - Epic 5 — History and analytics
  - Epic 6 — Quality and deployment
notes:
  - UX design contract not available; UX-DR section empty pending bmad-ux
  - Experience level deferred (not in PRD MVP)
  - Role/date filters treated as stretch unless confirmed in epic design
---

# ai-interview-platform - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ai-interview-platform, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can register with email magic link or OAuth (Google).
FR2: User can sign out from any authenticated page.
FR3: System creates Account on first successful authentication and associates subsequent sessions with the same Account.
FR4: System rejects unauthenticated access to Profile, Resume, Interview, Report, History, and Dashboard routes.
FR5: User can view Profile (display name, email read-only, default Target Role).
FR6: User can update display name and default Target Role; changes persist immediately.
FR7: On first login, User is prompted to complete minimal Profile if display name missing.
FR8: User can upload PDF or DOCX up to 5 MB.
FR9: System stores resume file securely and produces Resume Summary text via extraction.
FR10: User can view and edit Resume Summary; edits override extraction for AI grounding.
FR11: User can replace Resume file; previous file is superseded for new Interviews.
FR12: User cannot start Interview without non-empty Resume Summary (minimum 100 characters).
FR13: System exposes Role Catalog of 5–8 SWE-oriented entries.
FR14: User must select one Target Role before starting an Interview.
FR15: Target Role is stored on Interview record and displayed in History and Report.
FR16: User configures planned duration (15/30 min), question count (5/8), and behavioral vs. technical mix presets.
FR17: System shows configuration summary before Interview start; User confirms to create Interview Session.
FR18: Configuration is immutable for the Interview once started.
FR19: User sees current Question and submits Answer as text (multiline, max 4,000 characters).
FR20: System persists Interview Session after each Answer; User can leave and resume in-progress Interview within 7 days.
FR21: User can end Interview early; status becomes `ended_early` and partial Evaluation runs on answered Questions only.
FR22: User completes Interview when question count reached or AI signals natural close within configuration bounds.
FR23: UI shows progress (question index of planned count) and elapsed time.
FR24: System generates initial Question using Target Role, Interview Configuration, and Resume Summary.
FR25: System generates follow-up Questions when Answer is vague, incomplete, or contradicts Resume Summary.
FR26: Questions must not request disallowed content; system prompt enforces interview scope.
FR27: Resume content is treated as untrusted data; ignore instruction-like text in Resume Summary.
FR28: System evaluates each Answer against Rubric dimensions (Clarity, Structure, Technical Depth, Relevance; scores 1–5 with rationale).
FR29: System produces session-level Evaluation aggregating Answer-level scores and recurring themes.
FR30: Evaluation must cite Resume Summary or Answer excerpts when claiming relevance gaps (no fabricated projects).
FR31: Evaluation output conforms to structured JSON schema validated before persistence.
FR32: On Interview completion, system generates Interview Report from Evaluation (PG-2).
FR33: Report includes overall summary, Rubric scores with rationales, ≥3 strengths, ≥3 improvement items, ≥1 suggested answer rewrite.
FR34: User can view Report from completion screen and from Interview History.
FR35: Report includes disclaimer that AI feedback is advisory, not a hiring decision.
FR36: User sees chronological list of Interviews with date, Target Role, status, overall score summary.
FR37: User opens Interview detail: full transcript, link to Interview Report, configuration snapshot.
FR38: Completed and `ended_early` Interviews are retained for account lifetime unless User deletes Account.
FR39: User can delete a single Interview and associated Report/transcript.
FR40: Dashboard shows count of completed Interviews and average overall score trend over time.
FR41: Dashboard shows recurring weakness tags (top 3 themes from improvement items across last N=5 sessions).
FR42: User can compare two or more completed Interviews via table of Rubric scores by session date (PG-4).

### NonFunctional Requirements

NFR1: HTTPS only; secrets in environment; resume and transcripts encrypted at rest.
NFR2: Privacy policy link in footer; Account deletion removes User data within 30 days.
NFR3: First Question generation p95 < 8s; Report generation p95 < 45s after Interview complete.
NFR4: WCAG 2.1 AA for core flows (MVP target; audit before public launch).
NFR5: Server logs with `interview_id`, `user_id`; error tracking for LLM failures.

### Additional Requirements

- Brownfield starter already present: Next.js 16 App Router + TypeScript strict + Tailwind 4 (extend existing repo; do not re-bootstrap create-next-app).
- Layered modular monolith: Presentation → Application (Server Actions / Route Handlers / services) → Domain → Infrastructure (AD paradigm).
- AD-1: Prisma and AI SDKs server-only; never in Client Components.
- AD-2: Every private Prisma query scoped by `userId`; missing resource → 404 not 403.
- AD-3: Shared `requireSession()` on all private Server Actions and Route Handlers.
- AD-4: Zod validate all external inputs and all AI model outputs before persistence.
- AD-5: AI provider abstraction via `src/lib/ai/client` (`generateStructured` / `generateText`).
- AD-6: Persist `promptId`, `promptVersion`, `modelId` on each AI generation.
- AD-7: On AI schema failure: one repair retry then fail safe; never persist partial unvalidated scores.
- AD-8: Interview status FSM: `in_progress` | `completed` | `ended_early` | `completed_pending_report` | `report_failed` | `abandoned`.
- AD-9: Resume file in private object storage; Resume Summary text in PostgreSQL for AI grounding.
- AD-10 [ADOPTED]: Auth.js (NextAuth v5) + Prisma adapter for MVP (not Clerk concurrently).
- AD-11: Server Actions for form/interview mutations; Route Handlers for multipart upload, rate-limited AI, health.
- AD-12: Rate limit AI-facing endpoints per `userId` (429 + retry-after).
- Deploy topology seed: Vercel + PostgreSQL (Neon/Supabase) + S3-compatible resume bucket + external LLM.
- Source tree seed: `src/app`, `src/lib/{auth,db,domain,validation,ai,storage}`, `src/server/{actions,services}`, `prisma/`.
- Env validated via Zod (`src/lib/env.ts`); structured logs without full resume/transcript content.
- UUID v4 IDs; UTC DateTimes; API error envelope `{ error: { code, message, field? } }`.
- Unit tests for domain logic; integration tests for API/DB + mocked AI; Playwright for critical E2E path.
- Product goals as release gates: PG-1 (start interview ≤5 min after registration), PG-2 (completed → report), PG-3 (history preserved), PG-4 (compare across interviews).
- Preferred epic structure from product owner: Foundation/auth → Resume/role → Interview generation → Evaluation/feedback → History/analytics → Quality/deployment.
- Deferred from preferred outline vs PRD: experience level field; role/date history filters are stretch unless confirmed in epic design.

### UX Design Requirements

None — no UX design contract found under planning artifacts. Visual/interaction stories will be derived from PRD acceptance criteria and architecture conventions until `bmad-ux` produces DESIGN.md + EXPERIENCE.md.

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
