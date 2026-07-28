# Feature Specification: User Authentication

**Feature Branch**: `001-user-auth`

**Created**: 2026-07-28

**Status**: Draft

**Input**: User description: "Implement the BMAD story for user authentication. Users must be able to register, sign in, sign out, and access a private dashboard. Unauthenticated visitors attempting to access private routes must be redirected to sign-in. Authenticated users must never access another user's resources. Include primary user flows, failure cases, session behavior, authorization rules, acceptance scenarios, and accessibility requirements. Do not select implementation libraries."

**Related BMAD story**: `_bmad-output/implementation-artifacts/1-1-account-authentication.md` (Story 1.1)

## Clarifications

### Session 2026-07-28

- Q: Which authentication methods must MVP offer? → A: Both passwordless email link and one external identity provider (Option B)
- Q: What does sign-out end across devices? → A: This session only; other devices stay signed in (Option A)
- Q: What is the minimum private dashboard for this feature? → A: Minimal private home with signed-in identity confirmation and sign-out (Option A)
- Q: How do the two auth methods relate to Account identity? → A: One Account per email across both methods (Option A)
- Q: What is the maximum idle session lifetime? → A: 30 days idle max (Option B)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register and reach private dashboard (Priority: P1)

A new candidate creates an account using an approved sign-up method, becomes signed in, and lands on a minimal private home that shows their identity and sign-out.

**Why this priority**: Without registration and a private home, no other product data (resume, interviews) can be kept private.

**Independent Test**: Complete registration as a first-time user and confirm the private dashboard loads for that user only.

**Acceptance Scenarios**:

1. **Given** I am a visitor with no account, **When** I successfully complete registration via passwordless email link or via the external identity provider, **Then** an account is created for me and I am signed in.
2. **Given** I have just registered successfully, **When** the flow completes, **Then** I can open the private dashboard, see my identity (name or email), and use sign-out.
3. **Given** I register or sign in with an email that already belongs to an existing Account (via either method), **When** authentication completes, **Then** I am signed into that same Account (no second Account for that email).

---

### User Story 2 - Sign in and sign out (Priority: P1)

A returning user signs in to continue private work, and can sign out so the next person on the device cannot use their session.

**Why this priority**: Session control is required for privacy on shared devices and for day-to-day use.

**Independent Test**: Sign in as an existing user, verify private dashboard access, sign out, and confirm private routes are no longer available without signing in again.

**Acceptance Scenarios**:

1. **Given** I have an existing account, **When** I successfully sign in with an approved method, **Then** I am authenticated and can access the private dashboard.
2. **Given** I am signed in, **When** I choose sign out from an authenticated screen, **Then** my current session ends on this device and I am treated as a visitor here (other devices remain signed in if applicable).
3. **Given** I have signed out, **When** I request the private dashboard, **Then** I am sent to sign-in and do not see private content.

---

### User Story 3 - Protect private routes (Priority: P1)

Visitors who are not signed in cannot view private areas; after they sign in they return to the place they originally tried to open when that is safe and appropriate.

**Why this priority**: Route protection is the primary control that keeps resumes and interview data private.

**Independent Test**: While signed out, request private dashboard (and other private areas in scope); confirm redirect to sign-in; after sign-in, confirm intended destination is honored when provided.

**Acceptance Scenarios**:

1. **Given** I am not signed in, **When** I request the private dashboard or another private route in scope, **Then** I am redirected to sign-in and no private content is shown.
2. **Given** I was redirected to sign-in from a private route, **When** I successfully sign in, **Then** I am returned to that private route (or a safe default private home if the original destination is invalid).
3. **Given** I am not signed in, **When** I use public pages (marketing/home and sign-in), **Then** those pages remain available without requiring authentication.

---

### User Story 4 - Own-data authorization (Priority: P1)

An authenticated user can only work with their own private records. Attempting to open another user’s resource fails without revealing whether it exists for someone else.

**Why this priority**: Cross-user access would violate the product’s privacy promise and constitution.

**Independent Test**: As user A, attempt to open user B’s private resource identifier; confirm failure without exposing B’s data; confirm user A still sees only A’s data on the dashboard.

**Acceptance Scenarios**:

1. **Given** I am signed in as user A, **When** I access private resources associated with my account, **Then** I receive my own data only.
2. **Given** I am signed in as user A, **When** I attempt to access a private resource that belongs to user B (by guessing or supplying another identifier), **Then** I do not receive B’s data and the outcome does not disclose ownership details beyond a generic not-found or denied-without-leak response.
3. **Given** my session has expired or is invalid, **When** I attempt a private action, **Then** I am treated as unauthenticated (prompted to sign in) and no private data is returned.

---

### User Story 5 - Accessible auth experience (Priority: P2)

Sign-in and related auth screens can be completed with keyboard and assistive technologies, with clear labels and visible focus.

**Why this priority**: Constitution requires accessible primary journeys; auth is the gateway to the product.

**Independent Test**: Complete sign-in using keyboard only; verify form fields have accessible names and focus is visible; verify errors are announced in a perceivable way.

**Acceptance Scenarios**:

1. **Given** I am on the sign-in screen, **When** I navigate using only the keyboard, **Then** I can reach all interactive controls in a logical order and see a visible focus indicator.
2. **Given** sign-in requires text input (e.g., email), **When** I inspect or use the field with assistive technology, **Then** the control has a proper accessible name/label.
3. **Given** an authentication error occurs, **When** the message is shown, **Then** it is programmatically associated with the relevant UI so users can perceive what went wrong without relying on color alone.

---

### Edge Cases

- Authentication provider or email delivery fails mid-flow → safe error, retry path available, no partial private access.
- Sign-in link or one-time credential is expired or already used → clear safe message and path to request a new attempt.
- User cancels an external identity consent screen → remain signed out; no account side effects beyond what the identity provider already completed.
- Session expires while viewing a private page → next private navigation or action requires sign-in again; no private content continues to refresh as if authenticated.
- Concurrent sessions on multiple devices → signing out on one device ends **only that device’s session**; other devices remain signed in until they sign out or their sessions expire.
- Malformed or missing return destination after sign-in → land on private dashboard (safe default), never on another user’s resource.
- User is already signed in and opens sign-in → redirect to private dashboard (or stay signed in without creating a second account).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Visitors MUST be able to register using either a passwordless email link or an external identity provider (both methods MUST be offered in MVP).
- **FR-002**: Existing users MUST be able to sign in using either a passwordless email link or the same class of external identity provider offered at registration.
- **FR-003**: Signed-in users MUST be able to sign out from an authenticated product surface; sign-out MUST end only the current session (other devices’ sessions remain active until they sign out or expire).
- **FR-004**: Successful registration MUST create exactly one Account per unique email address; signing in later with either MVP method that presents the same email MUST authenticate that same Account (no duplicate Accounts for one email).
- **FR-005**: The product MUST provide a private dashboard reachable only when authenticated; for this feature the dashboard MUST show the signed-in user’s identity (at least display name or email) and a sign-out control (stub links to other private areas MAY be included).
- **FR-006**: Unauthenticated requests to private routes (including the private dashboard and other private areas in MVP scope such as profile, history, and interview areas) MUST redirect to sign-in without exposing private content.
- **FR-007**: After successful sign-in following a redirect from a private route, the user MUST be returned to that route when it is a valid private destination, otherwise to the private dashboard.
- **FR-008**: The system MUST maintain an authenticated session for the user across normal browsing until sign-out or idle expiry; idle sessions MUST expire after 30 days of inactivity.
- **FR-009**: Expired or invalid sessions MUST be treated as unauthenticated for private routes and private actions.
- **FR-010**: Every private record read or write MUST be limited to the authenticated user’s own records.
- **FR-011**: Attempts to access another user’s private records MUST fail without leaking the other user’s data or confirming cross-user existence beyond a generic failure.
- **FR-012**: Authentication and authorization failures MUST present safe, user-facing messages (no secrets, stack traces, or internal provider details).
- **FR-013**: Where a retry or resend is applicable (e.g., expired one-time sign-in credential), the product MUST offer a clear path to try again.
- **FR-014**: Public surfaces (home/marketing and sign-in) MUST remain usable without authentication.
- **FR-015**: Auth screens MUST support keyboard operation, semantic structure, labeled inputs, and visible focus states (Constitution V).
- **FR-016**: The critical authentication flows (register or sign-in, sign-out, unauthenticated redirect, and at least one failure case) MUST be covered by automated tests before the feature is considered done (Constitution III).

### Key Entities

- **Account**: The durable identity of a person using the product, keyed by unique email; owns that user’s private data. Both MVP authentication methods resolve to the same Account when they share that email.
- **Session**: The authenticated period during which the product treats the visitor as a specific Account on a given client; ends on sign-out of that session or on expiry. Multiple concurrent sessions per Account are allowed.
- **Private dashboard**: The authenticated home surface for this feature: confirms the signed-in user’s identity (display name or email) and provides sign-out; may include stub navigation to other private areas. Not a full progress/analytics dashboard.
- **Private resource**: Any user-owned record or page (dashboard, profile, resume, interview, report, history) that must not be visible to other users or visitors.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration and open the private dashboard in under 5 minutes under normal conditions.
- **SC-002**: In usability or QA checks, 100% of unauthenticated attempts to open private routes result in sign-in redirect with zero private content exposed.
- **SC-003**: In authorization tests, 100% of cross-user private resource access attempts by an authenticated user fail without exposing the other user’s content.
- **SC-004**: After sign-out, 100% of subsequent private-route requests require sign-in again before private content is shown.
- **SC-005**: Users can complete the primary sign-in path using keyboard only.
- **SC-006**: Automated E2E coverage exercises the critical auth path (unauthenticated private redirect, sign-in UI methods, safe failure messaging, and sign-out gating when credentials are available).
- **SC-007**: Idle sessions expire after 30 days of inactivity; afterward, private routes require sign-in again before private content is shown.

### Constitution Constraints *(include when feature touches gated concerns)*

- [x] Type safety / Zod boundaries (I) — applies at planning/implementation; not specified as a library here
- [x] Authz scoping & no sensitive logging (II)
- [x] Tests for ACs + E2E if critical path (III)
- [ ] AI schema, retry/reject, prompt version, score rationale (IV) — not in scope
- [x] Accessibility for UI (V)
- [x] No unjustified new dependencies (VI) — deferred to plan; avoid unnecessary stack expansion
- [x] Requirement ↔ AC ↔ task mapping (VII)

## Assumptions

- Email uniqueness for Accounts is case-insensitive for matching purposes (e.g., User@Example.com and user@example.com map to one Account).
- MVP MUST offer two authentication method classes: passwordless email link and one external identity provider; this specification does not name vendors or libraries.
- Both methods MUST resolve to the same Account when they share the same email.
- “Private routes in scope” for redirects include private dashboard plus other authenticated areas of the interview platform (profile, history, interview flows) even if those areas are stubs during this feature.
- Session idle lifetime is **30 days**; expiry MUST be enforced for private routes and actions.
- Cross-user access attempts return a generic not-found style outcome to avoid account enumeration across users.
- This feature does not include account deletion, password reset for password accounts, multi-factor enrollment, team/organization accounts, or role-based admin access.
- Safe error copy is preferred over detailed provider diagnostics in the UI; operational detail may exist in server-side logs without including resume or interview answer bodies.
- BMAD Story 1.1 is the delivery vehicle for this specification’s outcomes.
