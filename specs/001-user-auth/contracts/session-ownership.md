# Contract: Session & ownership helpers

## `auth()` (Auth.js)

- Server Components / layouts / middleware helper: returns session or `null`
- Session MUST include `user.id` and preferably `user.email` / `user.name`

## `requireSession()`

- **Input**: none (reads server session)
- **Success**: `{ user: { id: string, email?: string | null, name?: string | null } }`
- **Failure**: throw/return unauthorized → HTTP **401** for actions/handlers; layouts redirect instead

## `assertOwned(resourceUserId: string, sessionUserId: string)`

- **Success**: void when IDs equal
- **Failure**: throw not-found style error → map to **404** (never 403 with “exists but forbidden” semantics)

## `normalizeEmail(email: string): string`

- Trim + lowercase
- Used before persistence and account linking comparisons

## Test obligations

| Helper | Vitest cases |
|--------|----------------|
| `normalizeEmail` | case fold; trim; empty invalid upstream via Zod |
| `assertOwned` | match passes; mismatch throws not-found |
| `requireSession` | mocked null → unauthorized; mocked user → returns user |
