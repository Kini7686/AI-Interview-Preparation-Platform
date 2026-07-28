# PRD Addendum: AI Interview Preparation Platform

Technical and reference detail supporting `prd.md`. Not duplicated in the main PRD narrative.

## Role Catalog (MVP seed)

| `role_id` | Display name |
|-----------|----------------|
| `junior_fullstack` | Junior Full-Stack Engineer |
| `junior_backend` | Junior Backend Engineer |
| `junior_frontend` | Junior Frontend Engineer |
| `new_grad_swe` | New Grad Software Engineer |
| `mid_swe_general` | Software Engineer (2–4 years) |
| `intern_swe` | Software Engineering Intern |
| `career_switcher_swe` | Software Engineer (career transition) |

[ASSUMPTION] Optimize prompt quality first for `junior_fullstack` and `new_grad_swe`.

## Rubric dimension definitions

| Dimension | 1 (weak) | 5 (strong) |
|-----------|----------|------------|
| Clarity | Hard to follow; jargon without explanation | Concise, easy to follow |
| Structure | No clear beginning/middle/end | STAR or equivalent clear arc |
| Technical Depth | Hand-wavy or incorrect | Accurate, appropriate depth for role |
| Relevance | Off-topic vs. question/role | Directly addresses question and role |

Overall score for trends = arithmetic mean of four dimensions, rounded to one decimal.

## Analytics event catalog (MVP)

All events include `timestamp`, `user_id` (server-side), and `session_id` where applicable. Client may omit raw email.

| Event | When |
|-------|------|
| `account_created` | First Account persisted |
| `sign_in_completed` / `sign_in_failed` | Auth result |
| `profile_viewed` / `profile_updated` | Profile screen |
| `resume_upload_*` / `resume_summary_edited` | Resume flow |
| `target_role_selected` | Role picked |
| `interview_configured` / `interview_start_confirmed` | Pre-interview |
| `interview_started` | First Question shown — **PG-1** |
| `answer_submitted` | Each Answer |
| `interview_completed` / `interview_ended_early` / `interview_abandoned` | Terminal states |
| `question_generated` / `question_generation_failed` | LLM question path |
| `evaluation_*` | Scoring pipeline |
| `report_*` | Report lifecycle |
| `history_viewed` / `interview_detail_viewed` / `interview_deleted` | History |
| `dashboard_viewed` / `performance_comparison_viewed` | **PG-4** |

[ASSUMPTION] MVP may log to application database + structured logs; product analytics vendor optional.

## Data retention (draft)

- Interview transcripts, Reports, and Resume files: retained until User deletes Interview or Account.
- Account deletion: hard-delete User-owned rows within 30 days; backups purged within 90 days `[ASSUMPTION]`.
- Magic link tokens: expire per provider defaults; not retained in application DB.

## Interview Configuration presets

| Preset | Behavioral : Technical (approx.) |
|--------|-----------------------------------|
| Behavioral-heavy | 70 : 30 |
| Balanced | 50 : 50 |
| Technical-heavy | 30 : 70 |

Technical questions in MVP are text-only (explain approach, tradeoffs, resume project deep-dives)—no code execution environment.

## Fallback question bank

Minimum 10 static Questions per Role Catalog entry for LLM outage fallback (FR-27 failure path). Content owned by product; seeded via migration.
