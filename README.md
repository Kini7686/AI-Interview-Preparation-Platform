# AI Interview Preparation Platform

A web application that helps students, new graduates, and software engineers practice for interviews through structured, text-based mock sessions—grounded in their resume and target role—and receive measurable feedback they can track over time.

This repository is not only an application codebase. It is also a working example of how **BMAD Method** and **GitHub Spec Kit** can drive product definition, architecture, and implementation in a consistent, agent-friendly workflow.

---

## What this project does

Candidates often get fragmented advice from chat tools and one-off mocks. This platform walks a user through a clear preparation loop:

1. **Create an account** and sign in securely  
2. **Set a profile** (display name and default target role)  
3. **Provide a resume summary** so practice stays grounded in real experience  
4. **Configure and run** a text mock interview for a chosen role  
5. **Review a structured report** (clarity, structure, technical depth, relevance)  
6. **Return to history** to compare sessions over time  

The product is scoped as an MVP for individual learners: desktop-first responsive web, no video/voice interviewers, and a modular path toward production AI evaluation.

---

## How it was structured: BMAD + Spec Kit

### BMAD Method

**BMAD** guided discovery and planning artifacts before code:

| Artifact | Role |
|----------|------|
| Product brief | Problem, audience, and MVP boundaries |
| PRD | Numbered functional requirements and feature slices |
| Architecture spine | Invariants, layering, and tech decisions agents must obey |
| Project context | Non-negotiable stack and coding rules for implementation |
| Implementation stories | Ready-for-dev units such as account authentication |

These live under `_bmad-output/` and `_bmad/`, so product intent stays versioned next to the code.

### GitHub Spec Kit

**Spec Kit** (`.specify/`, `specs/`) turned planning into executable feature contracts:

| Piece | Role |
|-------|------|
| Constitution | Shared engineering principles (type safety, security, tests, accessibility, simplicity, traceability) |
| Feature specs | Behavior-first specs (e.g. `specs/001-user-auth`) |
| Plans & research | Stack choices and constraints for each feature |
| Tasks | Ordered implementation checklist agents can execute |
| Contracts / data model | Session ownership, auth HTTP behavior, entities |

Together, BMAD answers *what to build and why*; Spec Kit answers *how to specify, gate, and implement it consistently*.

---

## Architecture at a glance

The system is a **layered modular monolith** on the Next.js App Router:

- **Presentation** — React Server Components and private app routes  
- **Application** — Server Actions and route handlers for mutations  
- **Domain** — Pure rules (interview lifecycle, validation, ownership)  
- **Infrastructure** — Prisma/PostgreSQL, Auth.js, storage, AI facade  

Private data is always scoped to the signed-in user. Auth uses Auth.js with database sessions; domain helpers enforce ownership on the server.

High-level planning sources:

- [`_bmad-output/project-context.md`](_bmad-output/project-context.md)  
- [`_bmad-output/planning-artifacts/architecture/`](_bmad-output/planning-artifacts/architecture/)  
- [`.specify/memory/constitution.md`](.specify/memory/constitution.md)  

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL + Prisma |
| Auth | Auth.js (Google + email magic link) |
| Validation | Zod |
| Testing | Vitest, Playwright |

---

## Repository layout

```text
src/                     Application source (App Router, lib, server actions)
prisma/                  Schema, migrations, seed data
specs/                   Spec Kit feature packages
.specify/                Constitution and Spec Kit tooling
_bmad/                   BMAD method install
_bmad-output/            Brief, PRD, architecture, stories, project context
.cursor/skills/          Spec Kit agent skills
```

---

## Getting started

```bash
npm install
cp .env.example .env    # fill local values — never commit .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Required local setup is documented in [`.env.example`](.env.example). Auth feature validation notes: [`specs/001-user-auth/quickstart.md`](specs/001-user-auth/quickstart.md).

### Useful scripts

```bash
npm run dev          # development server
npm run build        # production build
npm test             # unit / domain tests
npm run test:e2e     # end-to-end tests
npm run db:migrate   # apply Prisma migrations
npm run db:seed      # seed role catalog
```

---

## Product & planning docs

| Doc | Path |
|-----|------|
| PRD | [`_bmad-output/planning-artifacts/prds/`](_bmad-output/planning-artifacts/prds/) |
| Brief | [`_bmad-output/planning-artifacts/briefs/`](_bmad-output/planning-artifacts/briefs/) |
| Architecture | [`_bmad-output/planning-artifacts/architecture/`](_bmad-output/planning-artifacts/architecture/) |
| Spec Kit auth feature | [`specs/001-user-auth/`](specs/001-user-auth/) |

---

## Vision

Build a preparation product where practice is **role-aware**, **resume-grounded**, and **measurable**—and where the engineering process itself stays as intentional as the product, through BMAD planning and Spec Kit specification.
