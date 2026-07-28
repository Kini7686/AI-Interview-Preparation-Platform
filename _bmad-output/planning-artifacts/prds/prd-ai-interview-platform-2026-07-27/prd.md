---
title: AI Interview Preparation Platform
status: final
created: 2026-07-27
updated: 2026-07-27
source_brief: ../briefs/brief-ai-interview-platform-2026-07-27/brief.md
---

# PRD: AI Interview Preparation Platform

## 0. Document Purpose

This PRD defines MVP requirements for a web-based AI interview preparation product. It is written for product, engineering, UX, and QA. It derives from the approved Product Brief (`brief-ai-interview-platform-2026-07-27`).

Structure: **Glossary-anchored vocabulary**, **globally numbered FRs**, features documented with user problem, story, requirements, acceptance criteria, validation rules, failure states, authorization, analytics, and MVP priority. Assumptions use `[ASSUMPTION]` tags and are indexed in §9.

## 1. Vision

Students, new graduates, and software engineers need realistic interview practice with feedback they can measure—not one-off chat advice. The platform guides users from registration through resume-aware, role-targeted **text mock Interviews**, produces a structured **Interview Report** after each session, and preserves **Interview History** so users can compare performance over time.

MVP is scoped for a solo developer: individual accounts, desktop-first responsive web, managed authentication, and a single LLM provider with structured evaluation output.

## 2. Target User

### 2.1 Jobs To Be Done

- Practice behavioral and resume-deep-dive questions aligned with a **Target Role** before real interviews.
- Get specific, measurable feedback on answers without scheduling a human mock.
- Track whether practice sessions are improving scores and recurring weak areas.
- Turn resume bullets into defensible stories under follow-up pressure.

### 2.2 Non-Users (v1)

- Hiring managers, recruiters, and enterprise talent teams (no team accounts).
- Users who require live video, human interviewers, or real-time voice.
- Candidates seeking company-specific leaked question banks.

### 2.3 Key User Journeys

- **UJ-1. Jordan completes a first mock within five minutes of registration.** Jordan, a new grad, creates an account, uploads a one-page resume, picks Junior Full-Stack Engineer, accepts default Interview Configuration, and enters the first Question. Jordan finishes the Interview and lands on the Interview Report. *Edge case:* resume parse fails; Jordan edits the Resume Summary manually and continues without re-uploading.

- **UJ-2. Jordan compares two past Interviews.** Jordan opens Interview History, selects two completed sessions, and views side-by-side overall rubric scores and recurring weakness tags on the Progress Dashboard.

## 3. Glossary

- **User** — An authenticated individual with one Account.
- **Account** — Identity record created through Authentication; owns Profile, Resume, and Interviews.
- **Profile** — User-editable attributes (display name, default Target Role).
- **Resume** — Uploaded file plus extracted and user-editable **Resume Summary** text used to ground questions and evaluation.
- **Resume Summary** — Structured text derived from upload and/or manual edit; source of truth for AI grounding.
- **Target Role** — A predefined job role from the Role Catalog (e.g., Junior Backend Engineer).
- **Role Catalog** — Fixed list of SWE-oriented roles selectable by the User.
- **Interview Configuration** — Pre-session parameters: planned duration, question count, behavioral vs. technical mix.
- **Interview** — A single mock session from start through completion or abandonment.
- **Interview Session** — In-progress Interview state including transcript and metadata.
- **Question** — An AI-generated prompt or follow-up within an Interview.
- **Answer** — User-submitted text response to a Question.
- **Evaluation** — AI assessment of Answers against a fixed rubric during and/or at end of Interview.
- **Interview Report** — Post-Interview artifact with rubric scores, strengths, gaps, and improvement items.
- **Interview History** — List of past Interviews with status, date, Target Role, and summary scores.
- **Progress Dashboard** — Aggregated view: session counts, score trends, recurring weakness tags, comparison across Interviews.
- **Rubric** — Fixed MVP dimensions: Clarity, Structure, Technical Depth, Relevance (each scored 1–5).

## 4. Measurable Product Goals

These goals are release gates for MVP:

| ID | Goal | Measurement |
|----|------|-------------|
| **PG-1** | A User can start an Interview within five minutes of registration | ≥80% of successful registrations in usability test complete first Question within 5 minutes; tracked via `interview_started` timestamp minus `account_created` |
| **PG-2** | A completed Interview produces a feedback report | 100% of Interviews with status `completed` have a persisted Interview Report with ≥3 rubric scores and ≥3 improvement items |
| **PG-3** | Interview History is preserved | 100% of completed Interviews appear in Interview History with transcript and Report link; no data loss on normal logout |
| **PG-4** | Users can compare performance across Interviews | Progress Dashboard shows trend of overall score (mean of rubric dimensions) for ≥2 completed Interviews and highlights recurring weakness tags |

## 5. Features

Each feature includes the fields required for implementation and QA. Functional requirements use global IDs **FR-1** through **FR-42**.

---

### F-01 Authentication

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Users need a secure personal Account to save Resume, Interviews, and Reports across sessions.

**User story:** As a candidate, I want to sign up and sign in quickly so that my practice data is private and persistent.

**Functional requirements**

- **FR-1:** User can register with email magic link or OAuth (Google) `[ASSUMPTION: Google + magic link only for MVP]`.
- **FR-2:** User can sign out from any authenticated page.
- **FR-3:** System creates Account on first successful authentication and associates subsequent sessions with the same Account.
- **FR-4:** System rejects unauthenticated access to Profile, Resume, Interview, Report, History, and Dashboard routes.

**Acceptance criteria**

- New User completes registration and reaches onboarding or home within 2 minutes under normal network conditions.
- Signed-out User attempting `/interviews/*` is redirected to sign-in with return URL preserved.
- Duplicate registration with same email resolves to single Account.

**Validation rules**

- Email must be valid format when using magic link.
- OAuth token must validate with provider before Account creation.

**Failure states**

- Magic link expired → show resend option; do not create duplicate Account.
- OAuth provider error → show retry; log error server-side.
- Session expired → redirect to sign-in; preserve in-progress Interview draft if policy allows `[ASSUMPTION: Interview auto-saved server-side]`.

**Authorization requirements**

- Public: sign-in, sign-up, OAuth callback, static marketing pages.
- Authenticated User: all product routes scoped to `user_id = session.user_id`.

**Analytics events**

- `account_created` — properties: `auth_method`, `user_id` (hashed in client if needed)
- `sign_in_completed` — properties: `auth_method`, `is_returning`
- `sign_in_failed` — properties: `auth_method`, `error_code`

---

### F-02 User Profile

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Users need a place to set identity and defaults so each Interview does not require re-entering basics.

**User story:** As a User, I want to edit my profile and default Target Role so that new Interviews start with sensible defaults.

**Functional requirements**

- **FR-5:** User can view Profile (display name, email read-only, default Target Role).
- **FR-6:** User can update display name and default Target Role; changes persist immediately.
- **FR-7:** On first login, User is prompted to complete minimal Profile if display name missing.

**Acceptance criteria**

- Updated display name appears on Dashboard and Interview Report header.
- Default Target Role pre-selects on new Interview Configuration when set.

**Validation rules**

- Display name: 1–80 characters, no leading/trailing whitespace only.
- Default Target Role must be null or a valid Role Catalog entry.

**Failure states**

- Save conflict / network error → inline error; retain edited values in form.
- Invalid role → block save with field error.

**Authorization requirements**

- User may read/write only their own Profile.

**Analytics events**

- `profile_viewed`
- `profile_updated` — properties: `fields_changed[]`

---

### F-03 Resume Upload

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Generic questions do not match the User's experience; Users need the system to know their background.

**User story:** As a User, I want to upload my resume and fix extracted text so that interview questions reference my real projects.

**Functional requirements**

- **FR-8:** User can upload PDF or DOCX up to 5 MB `[ASSUMPTION]`.
- **FR-9:** System stores file securely and produces Resume Summary text via extraction.
- **FR-10:** User can view and edit Resume Summary in a text editor; edits override extraction for AI grounding.
- **FR-11:** User can replace Resume file; previous file is superseded for new Interviews `[ASSUMPTION: retain old file for past Interview audit optional]`.
- **FR-12:** User cannot start Interview without non-empty Resume Summary (minimum 100 characters `[ASSUMPTION]`).

**Acceptance criteria**

- Successful upload shows parsed Resume Summary within 30 seconds p95 or shows manual entry path on parse failure.
- Interview Configuration is blocked until FR-12 satisfied.
- PG-1 test path: upload + edit completes within onboarding time budget.

**Validation rules**

- MIME/type allowlist: `application/pdf`, DOCX MIME.
- Max size enforced before upload completes.
- Resume Summary length 100–20,000 characters after trim.

**Failure states**

- Parse failure → message + empty editable Resume Summary; User can type manually.
- Upload virus scan fail `[ASSUMPTION: defer AV scan MVP]` → reject with generic error.
- Storage failure → retry; do not mark upload complete.

**Authorization requirements**

- User read/write own Resume only; file URLs must not be guessable (signed URLs or auth-proxied download).

**Analytics events**

- `resume_upload_started` — properties: `file_type`, `file_size_kb`
- `resume_upload_completed` — properties: `parse_success` boolean
- `resume_summary_edited`

---

### F-04 Job Role Selection

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Interview content must match the job the User is pursuing, not a generic SWE quiz.

**User story:** As a User, I want to select a Target Role for each Interview so that questions match my job search.

**Functional requirements**

- **FR-13:** System exposes Role Catalog of 5–8 entries (see addendum).
- **FR-14:** User must select one Target Role before starting an Interview.
- **FR-15:** Target Role is stored on Interview record and displayed in History and Report.

**Acceptance criteria**

- Every Role Catalog entry is selectable and produces role-appropriate Question themes in manual QA spot check.
- Invalid or deprecated role ID cannot be submitted.

**Validation rules**

- `target_role_id` must exist in Role Catalog enum/table.

**Failure states**

- Role Catalog unavailable → block Interview start; show maintenance message.

**Authorization requirements**

- Role Catalog read: authenticated User; write: admin-only outside MVP (seed data).

**Analytics events**

- `target_role_selected` — properties: `role_id`, `context` (`profile_default` | `interview_config`)

---

### F-05 Interview Configuration

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Users need control over session length and question style without configuring complex options.

**User story:** As a User, I want to configure my mock interview before it starts so that practice fits my schedule and focus.

**Functional requirements**

- **FR-16:** User configures: planned duration (15 / 30 minutes), question count (5 / 8), behavioral vs. technical mix (preset: Behavioral-heavy, Balanced, Technical-heavy).
- **FR-17:** System shows summary of configuration before Interview start; User confirms to create Interview Session.
- **FR-18:** Configuration is immutable for the Interview once started.

**Acceptance criteria**

- Default configuration (30 min, 8 questions, Balanced) enables PG-1 fast path.
- Confirmation screen displays Target Role + Resume Summary snippet (first 200 chars).

**Validation rules**

- Enum validation for all configuration fields.
- Question count × estimated time must not exceed planned duration `[ASSUMPTION: enforced softly via AI pacing]`.

**Failure states**

- Missing Target Role or Resume Summary → redirect to prerequisite step with explanation.

**Authorization requirements**

- User creates Configuration only for own Interviews.

**Analytics events**

- `interview_configured` — properties: `duration_min`, `question_count`, `mix_preset`, `role_id`
- `interview_start_confirmed`

---

### F-06 Text-Based Mock Interview

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Users need a realistic turn-based interview experience without video or voice.

**User story:** As a User, I want to answer interview questions in a chat-like interface so that I can practice under time pressure and save my progress.

**Functional requirements**

- **FR-19:** User sees current Question and submits Answer as text (multiline, max 4,000 characters per Answer).
- **FR-20:** System persists Interview Session after each Answer; User can leave and resume in-progress Interview within 7 days `[ASSUMPTION]`.
- **FR-21:** User can end Interview early; status becomes `ended_early` and partial Evaluation runs on answered Questions only.
- **FR-22:** User completes Interview when question count reached or AI signals natural close within configuration bounds.
- **FR-23:** UI shows progress (e.g., question index of planned count) and elapsed time.

**Acceptance criteria**

- Transcript order matches chronological Q/A pairs.
- Refresh mid-Interview restores same Question without duplicate Question insert.
- PG-1: time from registration to first Answer submit ≤ 5 minutes in benchmark script.

**Validation rules**

- Answer must be non-empty after trim to submit.
- Interview must be `in_progress` to accept Answer.

**Failure states**

- LLM timeout → retry button; do not lose last Answer draft client-side.
- Interview already completed → read-only transcript view.
- Concurrent tabs → last-write-wins with warning `[ASSUMPTION: single active writer]`.

**Authorization requirements**

- User read/write only own Interview Sessions.

**Analytics events**

- `interview_started` — properties: `interview_id`, `role_id`, config properties; **PG-1 anchor**
- `answer_submitted` — properties: `interview_id`, `question_index`, `answer_length`
- `interview_completed` — properties: `interview_id`, `duration_sec`, `questions_answered`
- `interview_ended_early`
- `interview_abandoned` — no Answer within 7 days in-progress

---

### F-07 AI-Generated Questions

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Static question lists do not probe resume claims or adapt to weak Answers.

**User story:** As a User, I want questions tailored to my role and resume with follow-ups when I am vague so that practice feels like a real interview.

**Functional requirements**

- **FR-24:** System generates initial Question using Target Role, Interview Configuration, and Resume Summary.
- **FR-25:** System generates follow-up Questions when Answer is vague, incomplete, or contradicts Resume Summary `[ASSUMPTION: detected by model + heuristics]`.
- **FR-26:** Questions must not request disallowed content (PII harvesting, illegal activity); system prompt enforces interview scope.
- **FR-27:** Resume content is treated as untrusted data; ignore instruction-like text in Resume Summary for tool behavior.

**Acceptance criteria**

- Spot check: 90% of Questions reference role or resume theme in manual review sample of 20 sessions `[ASSUMPTION: QA process]`.
- Follow-up appears at least once when Answer < 50 words on behavioral Question in test scenarios.

**Validation rules**

- Question text length 10–2,000 characters stored.
- Maximum 2 follow-ups per primary Question `[ASSUMPTION]` to control cost.

**Failure states**

- Generation failure → show retry; after 3 failures offer simplified fallback Question from template bank `[ASSUMPTION: small static fallback set]`.
- Content filter trigger → regenerate or substitute safe Question.

**Authorization requirements**

- LLM calls only server-side; User cannot inject system prompts from client.

**Analytics events**

- `question_generated` — properties: `interview_id`, `question_index`, `is_followup`
- `question_generation_failed` — properties: `error_code`, `retry_count`

---

### F-08 AI Evaluation of Answers

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Users cannot self-score reliably; they need consistent, measurable assessment.

**User story:** As a User, I want each session evaluated against clear criteria so that I know what to improve.

**Functional requirements**

- **FR-28:** System evaluates each Answer against Rubric dimensions (scores 1–5 with brief rationale).
- **FR-29:** System produces session-level Evaluation aggregating Answer-level scores and recurring themes.
- **FR-30:** Evaluation must cite Resume Summary or Answer excerpts when claiming relevance gaps (no fabricated projects).
- **FR-31:** Evaluation output conforms to structured schema (JSON) validated before persistence.

**Acceptance criteria**

- Every completed Interview has Evaluation payload passing schema validation.
- Each dimension includes integer score 1–5 and ≥1 sentence rationale.

**Validation rules**

- Scores ∈ {1,2,3,4,5}; missing dimension fails persistence.
- Rationale max 500 characters per dimension `[ASSUMPTION]`.

**Failure states**

- Evaluation timeout → Interview status `completed_pending_report`; background retry or user-triggered regenerate.
- Schema validation fail → retry generation once; else flag support with `report_failed` status.

**Authorization requirements**

- Evaluation visible only to Interview owner.

**Analytics events**

- `evaluation_started` — properties: `interview_id`
- `evaluation_completed` — properties: `interview_id`, `duration_ms`
- `evaluation_failed` — properties: `error_code`

---

### F-09 Interview Report

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Raw chat logs do not summarize what to fix before the next real interview.

**User story:** As a User, I want a structured report after my mock so that I have actionable feedback I can reread.

**Functional requirements**

- **FR-32:** On Interview completion, system generates Interview Report from Evaluation (PG-2).
- **FR-33:** Report includes: overall summary, Rubric scores with rationales, ≥3 strengths, ≥3 improvement items, ≥1 suggested answer rewrite `[ASSUMPTION]`.
- **FR-34:** User can view Report from completion screen and from Interview History.
- **FR-35:** Report includes disclaimer that AI feedback is advisory, not a hiring decision.

**Acceptance criteria**

- PG-2: 100% completed Interviews have Report meeting FR-33 minima.
- Report renders in <2s from DB after generation complete.

**Validation rules**

- Report immutable after generation `[ASSUMPTION]`; regenerate creates new version only via explicit admin action outside MVP.

**Failure states**

- Report pending → loading state with retry; link from History when ready.
- Report failed → error state with support contact `[ASSUMPTION: email link]`.

**Authorization requirements**

- User read own Reports only.

**Analytics events**

- `report_viewed` — properties: `interview_id`, `source` (`post_interview` | `history`)
- `report_generation_completed`
- `report_generation_failed`

---

### F-10 Interview History

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Users lose context across practice sessions without a durable record.

**User story:** As a User, I want to see all past interviews so that I can reopen transcripts and reports.

**Functional requirements**

- **FR-36:** User sees chronological list of Interviews with date, Target Role, status, overall score summary.
- **FR-37:** User opens Interview detail: full transcript, link to Interview Report, configuration snapshot.
- **FR-38:** Completed and `ended_early` Interviews are retained for account lifetime unless User deletes Account `[ASSUMPTION: retention policy in addendum]`.
- **FR-39:** User can delete a single Interview and associated Report/transcript (GDPR-style erasure).

**Acceptance criteria**

- PG-3: completed Interviews always listed; pagination after 20 items `[ASSUMPTION]`.
- Delete removes from History within 30 seconds and invalidates cached URLs.

**Validation rules**

- List endpoint returns only Interviews for authenticated User.

**Failure states**

- Empty history → empty state CTA to start first Interview.
- Detail not found → 404 friendly page.

**Authorization requirements**

- Strict `user_id` scoping on list and detail.

**Analytics events**

- `history_viewed`
- `interview_detail_viewed` — properties: `interview_id`
- `interview_deleted`

---

### F-11 Basic Progress Dashboard

| Field | Detail |
|-------|--------|
| **MVP priority** | P0 |

**User problem:** Users cannot tell if they are improving without comparing sessions over time.

**User story:** As a User, I want a dashboard showing trends and weak areas so that I know what to practice next.

**Functional requirements**

- **FR-40:** Dashboard shows count of completed Interviews and average overall score (mean of Rubric dimensions per session, then trend over time).
- **FR-41:** Dashboard shows recurring weakness tags (top 3 themes from improvement items across last N sessions, N=5 `[ASSUMPTION]`).
- **FR-42:** User can compare two or more completed Interviews: table of Rubric scores by session date (PG-4).

**Acceptance criteria**

- With ≥2 completed Interviews, trend chart or table displays at least two data points.
- Comparison view loads within 2s p95 for ≤50 historical sessions.

**Validation rules**

- Aggregates computed from completed Interviews only.

**Failure states**

- Single session → show scores with message that comparison unlocks after second completion.
- Aggregation error → partial dashboard with error banner.

**Authorization requirements**

- Dashboard data scoped to User's Interviews only.

**Analytics events**

- `dashboard_viewed`
- `performance_comparison_viewed` — properties: `interview_ids[]`, `count`

---

## 6. Cross-Cutting Non-Functional Requirements

- **NFR-1 Security:** HTTPS only; secrets in environment; resume and transcripts encrypted at rest `[ASSUMPTION: provider default]`.
- **NFR-2 Privacy:** Privacy policy link in footer; Account deletion removes User data within 30 days.
- **NFR-3 Performance:** First Question generation p95 < 8s; Report generation p95 < 45s after Interview complete.
- **NFR-4 Accessibility:** WCAG 2.1 AA for core flows `[ASSUMPTION: MVP target, audit before public launch]`.
- **NFR-5 Observability:** Server logs with `interview_id`, `user_id`; error tracking for LLM failures.

## 7. Non-Goals (Explicit)

- Live video, human interviewers, real-time voice I/O.
- Native mobile apps (responsive web only).
- Team, enterprise, SSO, seat management.
- Payments and billing.
- Live coding IDE, system design whiteboard, company-specific question leaks.

## 8. MVP Scope

### 8.1 In Scope

Features F-01 through F-11 at P0; Product Goals PG-1 through PG-4.

### 8.2 Out of Scope for MVP

As listed in §7; monetization and B2B deferred per brief.

## 9. Success Metrics

**Primary**

- **SM-1:** PG-1 activation — ≥80% start Interview within 5 minutes of registration (validates FR-1–FR-19, onboarding path).
- **SM-2:** PG-2 report completeness — 100% completed Interviews have valid Report (validates FR-28–FR-33).
- **SM-3:** Second-session retention — ≥70% of Users with one completed Interview start a second within 14 days `[ASSUMPTION from brief]`.

**Secondary**

- **SM-4:** PG-4 comparison usage — ≥40% of Users with ≥2 completed Interviews use comparison view within 30 days.

**Counter-metrics**

- **SM-C1:** Do not optimize for total Questions per session if it reduces Report quality or increases cost per session.

## 10. Open Questions

1. Final Role Catalog labels and seed content owner.
2. Account deletion SLA and legal retention exceptions.
3. Fallback Question bank scope when LLM unavailable.

## 11. Assumptions Index

- Google OAuth + magic link only for MVP (FR-1).
- Interview in-progress resume window 7 days (FR-20).
- Resume 5 MB max; Summary 100 char minimum (FR-8, FR-12).
- Max 2 follow-ups per primary Question (FR-27).
- Immutable Report after publish (FR-35 validation).
- Retention until Account deletion unless single Interview delete (FR-38, FR-39).

## 12. FR Traceability Summary

| Feature | FR IDs |
|---------|--------|
| F-01 Authentication | FR-1 – FR-4 |
| F-02 User Profile | FR-5 – FR-7 |
| F-03 Resume Upload | FR-8 – FR-12 |
| F-04 Job Role Selection | FR-13 – FR-15 |
| F-05 Interview Configuration | FR-16 – FR-18 |
| F-06 Text Mock Interview | FR-19 – FR-23 |
| F-07 AI-Generated Questions | FR-24 – FR-27 |
| F-08 AI Evaluation | FR-28 – FR-31 |
| F-09 Interview Report | FR-32 – FR-35 |
| F-10 Interview History | FR-36 – FR-39 |
| F-11 Progress Dashboard | FR-40 – FR-42 |
