<!--
Sync Impact Report
- Version change: (none / template) → 1.0.0
- Modified principles: template placeholders → I–VII concrete principles (first adoption)
- Added sections: Platform Constraints; Development Workflow & Quality Gates
- Removed sections: none (template slots filled)
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ updated (Constitution Check gates)
  - .specify/templates/spec-template.md ✅ updated (traceability + constitution constraints)
  - .specify/templates/tasks-template.md ✅ updated (test-first mandatory; AC mapping)
  - .specify/templates/checklist-template.md ⚠ pending (no constitution-specific content to change)
  - .cursor/skills/speckit-* ⚠ pending (generic; no outdated agent-only refs found)
  - README.md ✅ updated (constitution pointer)
  - AGENTS.md ✅ updated (constitution pointer)
- Follow-up TODOs: none
-->

# AI Interview Preparation Platform Constitution

## Core Principles

### I. Type Safety

TypeScript MUST run in `strict` mode. Unjustified `any` types are forbidden;
any escape hatch MUST include a comment citing the story or ticket and a removal
plan. All external input (HTTP, forms, uploads, environment) and all AI-generated
data MUST be validated with Zod schemas before use or persistence.

**Rationale**: Runtime data from users and models is untrusted; compile-time types
alone cannot protect persistence or scoring pipelines.

### II. Security and Privacy

Every private record MUST be scoped to the authenticated user on read and write
(missing resource → not found, not a privilege leak). Resume content and full
interview answer text MUST NOT appear in application logs. Uploads MUST enforce
allowlisted file types and maximum size before storage. Secrets MUST exist only
in server-side environment variables and MUST NEVER be exposed to the client or
committed to git.

**Rationale**: Resumes and interview transcripts are sensitive personal data;
tenancy mistakes and log leakage are unacceptable for this product.

### III. Test-First Delivery

Every feature MUST include automated tests that cover its acceptance criteria
before or as part of the same delivery as the implementation. Critical user flows
MUST have end-to-end tests (Playwright). Bug fixes MUST add a regression test that
fails without the fix and passes with it.

**Rationale**: Interview scoring and auth regressions are costly; tests are the
proof that acceptance criteria remain true.

### IV. AI Reliability

AI outputs MUST use structured schemas (JSON / provider schema mode) and MUST
pass Zod validation before persistence. Invalid output MUST be retried once with
a repair path or rejected safely—never partially saved as scores or reports.
Prompts MUST be versioned and identifiable (`promptId` + `promptVersion`) on each
generation. AI-generated scores MUST include a written rationale per scored
dimension.

**Rationale**: Unvalidated model text becomes false product truth; versioned
prompts and rationales make feedback auditable and improvable.

### V. Accessibility

Interactive UI MUST support keyboard navigation, use semantic HTML, and provide
proper labels and visible focus states. Visual design MUST remain WCAG-conscious
for contrast on core flows (target WCAG 2.1 AA for primary journeys).

**Rationale**: Candidates practicing for interviews include keyboard and
assistive-technology users; inaccessible practice tools exclude them.

### VI. Simplicity

Unnecessary libraries MUST be avoided. Prefer framework-native capabilities
(Next.js App Router, Server Components, Server Actions / Route Handlers) before
adding packages. New dependencies MUST be justified (problem, alternative
rejected, maintenance cost) in the feature plan Complexity Tracking table when
they expand the surface area.

**Rationale**: Solo-developer MVP velocity depends on a thin, coherent stack.

### VII. Traceability

Every implementation task MUST map to a requirement ID and acceptance criterion
(or NFR). Specs, plans, tasks, tests, and code MUST remain aligned; when
requirements change, dependent artifacts MUST be updated in the same change set
or immediately follow-up PR.

**Rationale**: Spec Kit and BMAD artifacts only create value if delivery stays
bound to them.

## Platform Constraints

- **Runtime**: Next.js App Router, TypeScript strict, Tailwind CSS; Server
  Components by default; Client Components only when required.
- **Data**: PostgreSQL via Prisma; user-owned queries always include `userId`
  (or equivalent) scoping.
- **Auth**: Single provider (Auth.js or Clerk—not both); server-side session
  checks on private routes and mutations.
- **AI**: Provider abstraction; no direct vendor SDK calls from UI layers.
- **Agent guidance**: `_bmad-output/project-context.md` and this constitution
  are binding for implementation agents; constitution wins on governance
  conflicts unless explicitly amended.
- **Non-goals for MVP governance**: live video, human interviewers, real-time
  voice, native mobile, team/enterprise accounts, and payments remain out of
  scope unless the PRD and this constitution are amended.

## Development Workflow & Quality Gates

1. Specify or refine requirements (`/speckit-specify`, BMAD PRD/epics) with
   acceptance criteria before implementation.
2. Plan with a passing **Constitution Check** (`/speckit-plan`).
3. Generate tasks that cite requirement and AC IDs (`/speckit-tasks`).
4. Implement with tests covering ACs; run unit/integration and E2E for critical
   paths before merge.
5. Code review MUST verify: user scoping, Zod on boundaries, no resume logging,
   prompt versioning when AI is touched, and dependency justification.
6. `/speckit-analyze` or implementation readiness checks SHOULD be run when
   specs and epics materially change.

## Governance

This constitution supersedes conflicting informal practice for this repository.
Amendments require: (1) documented change with version bump, (2) Sync Impact
Report in this file, (3) propagation to Spec Kit templates and agent guidance
when principles change, and (4) ratification noted via `Last Amended` date.

**Versioning**: MAJOR for incompatible principle removals/redefinitions; MINOR
for new principles or materially expanded gates; PATCH for clarifications and
typos.

**Compliance**: PRs and agent-delivered stories MUST NOT knowingly violate
Core Principles. Temporary exceptions require an entry in Complexity Tracking
(or equivalent ADR) with owner and removal condition.

**Guidance files**: `.specify/memory/constitution.md` (this file),
`_bmad-output/project-context.md`, and Spec Kit templates under `.specify/templates/`.

**Version**: 1.0.0 | **Ratified**: 2026-07-28 | **Last Amended**: 2026-07-28
