# PetKeep Backend — Critical Issue Task Breakdown

Scope: findings **C1–C4** from the senior engineering review. Each task is
independently implementable and testable; dependencies are explicit below.

---

## C1 — Remove client-supplied role escalation

### C1-1 — Force `ROLE_USER` on registration

Make registration always create `ROLE_USER` server-side. Remove `role` from the
register contract (drop the field from the request DTO or stop reading it) and
hard-code `Role.USER` in the controller/service.

- **Files:** `CreateUserRequest`, `AuthController` (maybe new `AuthService`)
- **Depends on:** —
- **Acceptance criteria:**
  - A request that includes `"role":"ADMIN"` still persists a `USER`
  - The DB never contains an admin created via `/register`

### C1-2 — Validate the registration payload

Add request validation to the register payload (non-blank, size limits on
`username`/`password`).

- **Files:** `CreateUserRequest`, `AuthController`
- **Depends on:** —
- **Acceptance criteria:**
  - Empty/oversized fields return `400` with a structured message naming the field
  - A valid payload passes unchanged

### C1-3 — Return `409` on duplicate usernames

Return a clean `409 Conflict` for duplicate usernames instead of an uncaught
`500`.

- **Files:** `AuthController` (or a new `@RestControllerAdvice`), `UserRepo`
- **Depends on:** —
- **Acceptance criteria:**
  - Registering the same username twice returns `409` on the second call
  - Response is a JSON body with no stack trace
  - The duplicate condition is not logged as an unexpected error

### C1-4 — Safe admin provisioning

Provide a safe path to provision ADMIN accounts that isn't public (e.g., startup
seeding from env config, or an admin-only endpoint guarded by an existing admin).

- **Files:** New `AdminBootstrap` or `AdminController` endpoint
- **Depends on:** —
- **Acceptance criteria:**
  - With no seeded admin, no admin exists in the DB
  - Once enabled, exactly the configured admin is created
  - No POST to `/register` can create an admin

**Sequence suggestion:** C1-1 -> C1-2, C1-3 (in parallel) -> C1-4.

**Proof tests:** integration tests hitting `/api/v1/auth/register` for
escalation (C1-1), validation (C1-2), duplicate (C1-3); a test asserting the
bootstrap path (C1-4).

---

## C2 — Externalize the JWT secret

### C2-1 — Read the signing key from configuration

Read the signing key from `@Value("${jwt.secret}")` (env / `application.properties`)
and remove the inline literal.

- **Files:** `JWTService`, `application.properties` (+ `.env.example` if kept in-repo)
- **Depends on:** —
- **Acceptance criteria:**
  - No literal secret remains in source
  - The app signs/validates tokens using the configured value
  - Changing the env var invalidates previously issued tokens

### C2-2 — Fail fast on missing or weak secret

Fail at startup when the secret is missing or too short for HS256 (< 32 bytes).

- **Files:** `JWTService` (or `ApplicationConfig`)
- **Depends on:** C2-1
- **Acceptance criteria:**
  - App refuses to start with `JWT_SECRET` unset or too short, with a clear message
  - App starts normally with a valid secret

### C2-3 — Add placeholder and docs

Add an inert placeholder + docs (`.env.example` / README note) so the key never
needs to be committed.

- **Files:** `.env.example` (repo root / backend), README
- **Depends on:** C2-1
- **Acceptance criteria:**
  - Repo diff shows zero real secrets
  - A fresh clone with only `.env.example` + placeholder runs after the developer
    sets a real value

**Proof tests:** `JWTService` standalone unit test that a known secret produces a
stable validity decision, and that short-secret startup throws (C2-2). No token
needs to be generated across restarts in tests.

---

## C3 — Stop serializing the `User` entity (password hash) to clients

### C3-1 — Return a user DTO from the admin list

Add a public user/pet response DTO and map `User` -> DTO in
`AdminController.getAllUsers` (id, username, role, locked-state, pet summary —
no password).

- **Files:** New DTO, `AdminController`, `AdminService`
- **Depends on:** —
- **Acceptance criteria:**
  - `GET /api/v1/admin/users` returns no `password` key anywhere in the JSON
  - All other intended fields remain

### C3-2 — Return a user DTO from pet endpoints

Replace the `ResponseEntity<User>` returns in `PetController.action` and
`PetController.deletePet` with the same/similar DTO.

- **Files:** `PetController` (shared DTO)
- **Depends on:** C3-1
- **Acceptance criteria:**
  - `POST /pet/action` and `DELETE /pet/{id}` responses contain the pet/user data
    the frontend needs
  - Responses never include the password field or entity internals

### C3-3 — Remove credential from `toString` and JSON

Neutralize the credential leak in `User.toString()` (drop `password`) and add
`@JsonIgnore` (or equivalent) on `getPassword()` as defense-in-depth.

- **Files:** `User`
- **Depends on:** —
- **Acceptance criteria:**
  - A serialized or logged `User` never contains the password hash
  - `toString()` output in logs omits it

### C3-4 — Serialization regression test

Add a serialization regression test sweeping all response models to assert
`password` is never present in any wire payload.

- **Files:** New test, response DTOs
- **Depends on:** C3-1, C3-2, C3-3
- **Acceptance criteria:**
  - Test fails if any future endpoint returns an entity containing a `password`
    field

**Proof tests:** integration tests deserializing each endpoint's JSON and
asserting absence of `password`; C3-3 verified with a serializer +
logger-under-test.

---

## C4 — Enforce ownership on pet endpoints (fix IDOR)

### C4-1 — Resolve identity from the authenticated principal

Introduce a single way to resolve the currently authenticated user (e.g.,
`@AuthenticationPrincipal` param, or one `SecurityUtils` / `CurrentUserService`
helper) so controllers stop accepting identity from the body.

- **Files:** New helper or controller params, `PetController`
- **Depends on:** —
- **Acceptance criteria:**
  - No controller reads `userId` from the request body/path for pet operations
  - Identity always comes from the authenticated principal

### C4-2 — Generate pet for the caller only

Point `/api/v1/pet/generate` at the principal's identity (ignore any body
`userId`).

- **Files:** `PetController`, `PetService`
- **Depends on:** C4-1
- **Acceptance criteria:**
  - Register users A and B; A calls generate with `userId` = B's id in the body
  - The pet is created on A; B's account is untouched

### C4-3 — Apply actions to the caller only

Point `/api/v1/pet/action` at the principal's identity.

- **Files:** `PetController`
- **Depends on:** C4-1
- **Acceptance criteria:**
  - Same cross-user test for FEED/CLEAN: the action only mutates the caller's pet
  - B's stats are unchanged

### C4-4 — Delete only the caller's pet

Make `/api/v1/pet/{id}` resolve to the caller's own pet only (validate id against
principal, or drop the id and act on own pet).

- **Files:** `PetController`, `PetService`
- **Depends on:** C4-1
- **Acceptance criteria:**
  - A cannot delete B's pet: returns `403`/`404`, B's pet still present
  - A can delete their own pet

### C4-5 — Cross-user security regression tests

Add integration tests covering the three cross-user attempts
(generate/action/delete) asserting both the failing status and that the victim's
document is byte-identical.

- **Files:** New integration tests
- **Depends on:** C4-2, C4-3, C4-4
- **Acceptance criteria:**
  - Test suite proves a caller can never read or mutate another user's resources
  - These tests are treated as a security regression gate

**Sequence:** C4-1 -> C4-2, C4-3, C4-4 (any order) -> C4-5.

---

## Cross-cutting note

C1-3 is the only task that touches error response shape; if a single consistent
JSON error body is preferred, fold C1-3 into one small `@RestControllerAdvice`
task now rather than later (it will ease finding H3 as well).