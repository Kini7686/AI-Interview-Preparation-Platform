# Contract: Auth HTTP surfaces

Behavioral contract for implementers and E2E tests. Not a formal OpenAPI file.

## Public routes

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| GET | `/` | Public | Marketing/home |
| GET | `/sign-in` | Public | Sign-in UI (Google + email magic link). If already authenticated → redirect `/dashboard` |
| GET | `/error` or `/sign-in?error=` | Public | Safe error message (FR-012) |
| GET/POST | `/api/auth/*` | Public (Auth.js) | Auth.js protocol handlers |

## Private routes

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| GET | `/dashboard` | Required | Minimal home: show name or email; sign-out control |
| GET | `/profile` | Required | Stub placeholder (proves FR-006) |
| GET | `/history` | Required | Stub placeholder |
| GET | `/interview` or `/interview/*` | Required | Stub or empty; unauthenticated → sign-in |

## Redirects

- Unauthenticated private GET → `302/307` to `/sign-in?callbackUrl=<encoded original path>`
- Successful sign-in with valid `callbackUrl` under private prefixes → that path
- Invalid/external `callbackUrl` → `/dashboard`
- Sign-out → public home or `/sign-in` (product choice: prefer `/`)

## Server Actions (application)

| Action | Auth | Success | Failure |
|--------|------|---------|---------|
| `requestMagicLink(email)` | Public | Accepts valid email; triggers provider send | Zod validation error (field message); rate/provider failure → safe message |
| `signOutAction()` | Session | Ends **current** session only | Already signed out → no-op / redirect |

## Error envelope (non-Auth.js JSON, if any)

```json
{ "error": { "code": "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION" | "AUTH_FAILED", "message": "<safe string>", "field": "<optional>" } }
```

Never include tokens, secrets, or stack traces.
