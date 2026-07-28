---
title: AI Interview Preparation Platform
status: draft
created: 2026-07-27
updated: 2026-07-27
---

# Product Brief: AI Interview Preparation Platform

## Executive Summary

Computer science students, new graduates, and software engineers preparing for interviews often practice alone with static question lists or generic chat tools. They lack realistic, role-aligned mock interviews and feedback they can measure and improve on over time.

This product is a **web-based AI interview preparation platform**. Users upload a resume, choose a target job role, configure a mock session, and complete a **text-based** interview with AI-generated questions and follow-ups. After each session they receive a **structured interview report** with specific, measurable evaluation of their answers. A **history and basic progress dashboard** show whether practice is translating into better scores.

The first release is scoped for **one developer**: authentication, core profile and resume flow, configurable text mocks, AI Q&A and evaluation, reports, and progress tracking. Live video, human interviewers, real-time voice, native mobile apps, team or enterprise accounts, and payments are **out of scope** for the MVP.

## The Problem

Interview preparation for software roles is high-stakes and repetitive, but feedback is scarce.

- **Students and new graduates** have limited access to mentors or peers who can run realistic mocks on short notice. Career services are often overloaded; friends give polite, inconsistent feedback.
- **Software engineers re-entering the market or switching roles** need practice that matches the **target role** (e.g., backend vs. frontend) and their **actual background**, not generic LeetCode or random behavioral prompts.
- **Self-serve tools** (books, question banks, raw LLM chat) do not maintain a consistent rubric, tie questions to the user’s resume, or show **progress across sessions**.

The cost of the status quo is wasted interview loops: weak stories repeated, vague answers unchallenged, and no clear signal on what to fix before the next real call.

## The Solution

A guided practice loop on the web:

1. **Sign in** and maintain a **profile** (including target role preferences).
2. **Upload a resume** so questions and feedback can reference the user’s experience and projects.
3. **Select a job role** and **configure** the mock (e.g., session length, question mix—behavioral vs. technical depth within text-only constraints).
4. **Complete a text-based mock interview**: AI asks questions, probes weak or vague answers, and stays within the chosen configuration.
5. **Receive an interview report** with **specific, measurable feedback** (scores or rubric dimensions, strengths, gaps, and actionable improvements).
6. **Review interview history** and a **basic progress dashboard** (e.g., session count, trend in scores or recurring weak areas).

The core outcome: users can **practice realistic interviews** and **receive feedback they can act on and track**, not one-off generic advice.

## What Makes This Different

Honest positioning for v1:

| Differentiator | Why it matters |
|----------------|----------------|
| **Resume- and role-aware mocks** | Questions and follow-ups align with what the user claims and what they are interviewing for. |
| **Structured evaluation** | End-of-session report with measurable dimensions, not only free-form chat. |
| **Persistence and progress** | History and dashboard make improvement visible across sessions. |
| **Focused MVP** | Text-only, individual accounts—depth on the core loop instead of breadth (video, marketplace, enterprise). |

**Not claimed for MVP:** proprietary models, guaranteed job outcomes, or company-specific question banks. The advantage is **product execution** on a tight loop: configure → interview → measure → repeat.

## Who This Serves

**Primary users**

- **Computer science students** (intern and new-grad recruiting): need frequent, low-friction practice and clear feedback before campus and online screens.
- **New graduates** (0–2 years): translating projects and coursework into concise interview stories; high volume of applications and screens.
- **Software engineers preparing for interviews** (lateral move or return to market): need role-targeted refresh on behavioral and resume-deep-dive questions in addition to coding prep elsewhere.

**Success for them:** complete multiple mocks, see scores or rubric trends improve, and enter real interviews with rehearsed stories tied to their resume and role.

**Secondary (later, not MVP-focused):** career switchers, bootcamp graduates—same loop applies once role and resume inputs are solid.

[ASSUMPTION] Initial go-to-market and UX copy prioritize **new grads and students**; experienced engineers are supported but not the sole design center until feedback validates demand.

## Success Criteria

**User success (MVP)**

- ≥70% of users who finish one mock start a **second session within 14 days** [ASSUMPTION: threshold to validate retention; tune after beta].
- Users rate post-session feedback as **actionable** (e.g., ≥4/5 on a single post-session prompt) for ≥60% of completed sessions [ASSUMPTION: survey in MVP or early beta].
- Measurable feedback is present on every completed report: at least **three rubric dimensions with scores** and **three concrete improvement items**.

**Product / delivery success**

- End-to-end flow works on desktop web: auth → profile → resume → role → configure → interview → report → history/dashboard.
- One developer can build, deploy, and operate v1 with managed auth, database, storage, and a single LLM provider.
- Known **cost per completed interview** documented for future monetization (payments excluded from MVP).

**Out of scope for MVP success metrics:** revenue, NPS benchmarks vs. incumbents, mobile app store ratings.

## Scope

**In scope (MVP)**

- Authentication (individual accounts only).
- User profile.
- Resume upload (with user ability to correct parsed content if parsing is imperfect [ASSUMPTION]).
- Job-role selection.
- Interview configuration (parameters that define a session before it starts).
- Text-based mock interview.
- AI-generated questions and follow-ups during the session.
- AI evaluation of answers (during and/or at end of session; consolidated in the report).
- Interview report (structured, measurable feedback).
- Interview history (list/detail of past sessions).
- Basic progress dashboard (aggregates from history, e.g., trends and counts).

**Explicitly out of scope (MVP)**

- Live video.
- Human interviewers or marketplace of coaches.
- Real-time voice (input/output).
- Native mobile application (responsive web is acceptable [ASSUMPTION]).
- Team or enterprise accounts (SSO, admin, seat management).
- Payments and billing.

Detailed capability notes and open product questions live in `addendum.md`.

## Vision

If the core loop proves valuable, the platform becomes the **default practice layer** between resume submission and live interviews: voice and video modes, richer role packs (e.g., system design prompts), spaced repetition on weak rubric tags, optional paid tiers, and partnerships with bootcamps or universities—without becoming a job board or applicant tracking system.

For the next 12–18 months after MVP, success looks like a retained cohort of individual users who complete **five or more** mocks each recruiting season and report higher confidence and clearer improvement themes—not the widest feature surface.

## Open Questions

- Which **single primary role** to optimize first for question quality (e.g., junior full-stack vs. backend) [ASSUMPTION: defer to PRD unless decided now].
- Minimum **interview configuration** knobs for v1 (duration, question count, behavioral vs. technical mix).
- Data retention and deletion policy for resumes and transcripts (required before public launch).
