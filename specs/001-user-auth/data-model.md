# Data Model: User Authentication

## Entities

### User (Account in product language)

| Field | Type | Rules |
|-------|------|-------|
| id | string (cuid/uuid) | PK |
| name | string? | Display; may come from Google |
| email | string? | Unique; store **normalized** lowercase; required for MVP linking |
| emailVerified | DateTime? | Set by Auth.js flows |
| image | string? | Optional avatar URL |
| createdAt / updatedAt | DateTime | Optional if adapter schema includes |

**Relationships**: has many `Account`, has many `Session`

**Validation**: `normalizeEmail(email)` before compare/store; unique constraint on email

### Account (OAuth / provider link)

| Field | Type | Rules |
|-------|------|-------|
| id | string | PK |
| userId | string | FK → User, cascade delete |
| type | string | Auth.js |
| provider | string | e.g. `google`, `resend` |
| providerAccountId | string | Provider subject |
| refresh_token, access_token, expires_at, token_type, scope, id_token, session_state | per Auth.js | Do not log |

**Uniqueness**: `@@unique([provider, providerAccountId])`

### Session

| Field | Type | Rules |
|-------|------|-------|
| id | string | PK |
| sessionToken | string | Unique |
| userId | string | FK → User |
| expires | DateTime | Enforce ≤ 30-day policy via Auth.js `maxAge` |

**Lifecycle**: Created on sign-in; deleted on sign-out **of this session**; expired rows treated as invalid (FR-009)

### VerificationToken

| Field | Type | Rules |
|-------|------|-------|
| identifier | string | Typically email |
| token | string | Unique |
| expires | DateTime | Short-lived magic link |

**Lifecycle**: Created on magic-link request; consumed/invalidated on use or expiry

## Relationships

```text
User 1─* Account
User 1─* Session
VerificationToken (standalone, keyed by email identifier)
```

## Ownership rules (future + stubs)

- Any future private entity (Resume, Interview, …) MUST include `userId` → `User.id`
- Lookup failure or `userId !== session.user.id` → **not found** (404 semantics), never cross-user payload

## State transitions

```text
Visitor --register/sign-in--> Authenticated (Session active)
Authenticated --sign-out (this Session)--> Visitor (other Sessions unaffected)
Authenticated --idle > 30d--> Session expired → Visitor on next private access
```

## Out of scope tables

Profile preferences, Resume, Interview, Report — not created in this feature.
