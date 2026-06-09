# Multi-User Workspaces Implementation Plan

## Context

The current codebase models a "workspace/account" implicitly through `profiles.account_slug` and attaches most commercial state directly to `auth.users` via `profiles.user_id`, `trials.user_id`, and `subscriptions.user_id`.

That is workable for a single-user starter, but it creates hard coupling between:

- person identity
- workspace identity
- workspace slug
- workspace billing
- workspace trial/subscription lifecycle

The safest path for this codebase is an incremental migration that introduces first-class workspaces and memberships while preserving existing auth and profile flows.

## Goals

- Support multiple users belonging to the same workspace.
- Keep `auth.users` as the person identity layer.
- Move workspace-level concerns to workspace-owned records.
- Preserve the existing thin action/domain-service architecture.
- Minimize destructive schema rewrites and allow staged cutover.

## Target Data Model

### 1. `profiles` stays user-scoped

Keep `profiles` as the per-user table for personal information.

Recommended shape:

```sql
profiles
- user_id uuid primary key references auth.users(id)
- first_name text
- last_name text
- platform_role text default 'user' -- optional rename from current role
- default_workspace_id uuid null
- created_at timestamptz
- updated_at timestamptz
```

Notes:

- `account_slug` should move out of `profiles`.
- Current `profiles.role` appears to be a platform-level admin flag used for `/admin`. Keep that concept, but rename it conceptually to `platform_role` to avoid confusion with workspace membership roles.
- `default_workspace_id` is useful once users can belong to more than one workspace.

### 2. New `workspaces` table

Add a first-class workspace/account entity.

Suggested columns:

```sql
workspaces
- id uuid primary key default gen_random_uuid()
- slug text unique not null
- name text not null
- owner_user_id uuid not null references auth.users(id)
- billing_owner_user_id uuid null references auth.users(id)
- status text not null default 'active' -- active | suspended | deleting | deleted
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
```

Notes:

- `owner_user_id` gives a stable "ultimate owner" for MVP governance.
- `billing_owner_user_id` can initially equal `owner_user_id`; keeping it explicit avoids another schema change later if billing responsibility is transferred.
- `slug` becomes the canonical workspace identifier currently represented by `profiles.account_slug`.

### 3. New `workspace_memberships` table

Use a join table for many-to-many membership.

Suggested columns:

```sql
workspace_memberships
- id uuid primary key default gen_random_uuid()
- workspace_id uuid not null references workspaces(id) on delete cascade
- user_id uuid not null references auth.users(id) on delete cascade
- role text not null -- owner | admin | member
- status text not null default 'active' -- active | invited | suspended
- invited_by_user_id uuid null references auth.users(id)
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
- unique (workspace_id, user_id)
```

Notes:

- For MVP, `owner` should exist exactly once per workspace.
- `status` can stay simple. If invites are stored separately, membership rows only need `active`.

### 4. New `workspace_invites` table

Do not overload memberships for invitation flow. Keep invites explicit.

Suggested columns:

```sql
workspace_invites
- id uuid primary key default gen_random_uuid()
- workspace_id uuid not null references workspaces(id) on delete cascade
- email text not null
- role text not null -- admin | member
- token_hash text unique not null
- invited_by_user_id uuid not null references auth.users(id)
- accepted_by_user_id uuid null references auth.users(id)
- expires_at timestamptz not null
- accepted_at timestamptz null
- revoked_at timestamptz null
- created_at timestamptz not null default now()
- unique (workspace_id, email) where accepted_at is null and revoked_at is null
```

Notes:

- Hash the invite token in the database; do not store raw tokens.
- Exclude `owner` from invite-assigned roles for MVP.

### 5. Move billing and trial ownership to workspace

Existing billing tables should become workspace-owned.

Recommended direction:

```sql
subscriptions
- add workspace_id uuid references workspaces(id)
- keep user_id temporarily during migration

trials
- add workspace_id uuid references workspaces(id)
- keep user_id temporarily during migration
```

Longer-term desired shape:

```sql
subscriptions
- workspace_id uuid not null
- billing_owner_user_id uuid null
- paddle_subscription_id text unique not null
...

trials
- workspace_id uuid not null
- plan text not null
- status text not null
...
```

## Conceptual Changes to Existing Tables and Assumptions

### `profiles`

Current state:

- personal profile
- workspace slug
- platform admin role

Target state:

- personal profile only
- optional platform admin role
- optional default workspace pointer

Implication:

- every read of `profiles.account_slug` becomes a workspace lookup instead
- every use of `profiles.role` must be reviewed to determine whether it means platform admin or workspace role

### `subscriptions`

Current state:

- keyed by `user_id`
- billing page and API assume one subscription per logged-in user
- Paddle webhook expects `customData.user_id`

Target state:

- keyed by `workspace_id`
- billing actions operate on the current workspace
- Paddle webhook should carry `workspace_id` and optionally `billing_owner_user_id`

Implication:

- `getUserSubscription()` becomes `getWorkspaceSubscription()`
- all `billing`, `cancel`, `reactivate`, `update-payment-method`, and checkout entrypoints need workspace context

### `trials`

Current state:

- keyed by `user_id`
- signup creates one trial per person
- trial warnings/expiration email jobs run per user

Target state:

- keyed by `workspace_id`
- workspace creation creates the trial
- warning jobs run per workspace and notify billing owner or owner

Implication:

- cron routes and email copy should stop implying that one user owns one workspace

### Account deletion assumptions

Current state:

- deleting a user deletes the whole "account" indirectly because user-owned rows cascade

Target state:

- deleting a user is no longer equivalent to deleting a workspace
- user deletion must be blocked or specialized if the user is the only owner of any workspace

Implication:

- `deleteAccount()` needs a policy check before user deletion
- ownership transfer or workspace deletion flows become required eventually

### Signup assumptions

Current state:

- signup always creates a new user, profile, slug, and trial together

Target state:

- signup still creates a personal profile
- default path can still create an initial workspace for the new user
- invite acceptance must support joining an existing workspace instead of creating a new one

## Auth and Session Implications

## Current workspace selection

MVP should support a single active workspace per session, even if the data model allows many memberships.

Recommended approach:

- resolve all memberships after auth
- choose active workspace using this order:
  1. explicit `workspace` route param if present
  2. `profiles.default_workspace_id`
  3. first active membership by `created_at`
- if the selected workspace is invalid, fall back safely

### URL strategy

Prefer introducing workspace-scoped routes rather than hiding workspace selection entirely in cookies.

Recommended route shape:

- `/w/[slug]/dashboard`
- `/w/[slug]/billing`
- `/w/[slug]/settings`
- `/w/[slug]/members`

Why:

- avoids ambiguous global state
- makes authorization checks explicit
- fits future multi-workspace switching cleanly

For MVP, a light redirect layer can preserve existing routes:

- `/dashboard` -> redirect to active workspace dashboard
- `/billing` -> redirect to active workspace billing
- `/account` remains user-scoped

### Proxy/auth middleware implications

`src/proxy.ts` should continue validating the user session with `getUser()`, but authorization must move deeper:

- proxy checks authentication only
- workspace existence and membership checks happen in route/server helpers and API routes

Recommended new helper concept:

- `getCurrentWorkspaceForUser(supabase, userId, slug?)`
- `requireWorkspaceMembership(...)`
- `requireWorkspaceRole(...)`

### Invite acceptance and auth

Need two supported paths:

- invited user already has an account: sign in, accept invite, create membership
- invited user does not have an account: sign up, then accept invite

Pragmatic MVP:

- accept invite only after authentication
- invite link stores token and redirects to login/signup if needed
- after auth confirmation, token is redeemed server-side

This avoids complex pre-auth workspace provisioning logic in the first iteration.

## Authorization Model

### Recommended roles

- `owner`
- `admin`
- `member`

### Role semantics

`owner`

- full workspace control
- manage billing
- invite/remove members
- promote/demote admins
- transfer ownership later
- cannot be removed without ownership transfer

`admin`

- manage members except owner-only actions
- invite members/admins
- revoke pending invites
- update non-billing workspace settings if those exist

`member`

- access product features within workspace
- no membership or billing management

### Platform admin vs workspace role

Keep these separate:

- `profiles.platform_role = admin` controls access to internal `/admin`
- `workspace_memberships.role` controls customer-facing workspace permissions

Do not reuse one for the other.

### RLS direction

For MVP, continue doing most privileged workspace membership mutations through server-side domain services. Add RLS aligned to membership visibility:

- users can `select` workspaces they belong to
- users can `select` memberships in workspaces they belong to
- users can `select` subscriptions/trials for workspaces they belong to
- write mutations for invites/membership role changes can remain admin-client mediated initially if that is simpler

This matches the current architecture, which already performs several privileged operations through server code.

## MVP UI Flows

### 1. Create workspace during signup

Keep the existing signup ergonomics:

- user enters name, email, password, workspace slug
- system creates:
  - auth user
  - profile
  - workspace
  - owner membership
  - workspace trial

This preserves the current onboarding feel while changing the underlying ownership model.

### 2. Workspace switcher

Even if most users start with one workspace, add a minimal switcher early.

MVP version:

- show current workspace in nav
- if user has multiple memberships, show a simple dropdown
- switching updates `default_workspace_id` and navigates to `/w/[slug]/...`

### 3. Invite member

MVP flow:

- owner/admin opens Members page
- enters email and role (`admin` or `member`)
- system creates invite row and sends email with acceptance link

Constraints:

- block duplicate active invites
- block inviting existing active members

### 4. Accept invite

MVP flow:

- user visits invite link
- if not authenticated, route to login/signup and return back
- after auth, validate token, email match, expiration, and invite status
- create membership
- mark invite accepted
- set `default_workspace_id` if user has none
- redirect to workspace dashboard

### 5. Member list

Members page should show:

- name
- email
- role
- joined date
- pending invite state

Recommended to show active members and pending invites in separate sections for clarity.

### 6. Role management

MVP permissions:

- owner can change admin/member roles
- admin can manage members and maybe other admins only if you explicitly allow it

Pragmatic safer default:

- only owner can promote/demote admins
- admin can remove members and invite members/admins

This is slightly stricter but reduces privilege-escalation edge cases.

### 7. Remove member

MVP rules:

- owner can remove admins and members
- admin can remove members
- nobody can remove the only owner
- members cannot remove anyone
- self-leave is allowed only if another owner exists, or for non-owners

### 8. Account settings split

The current `/account` page mixes user profile and workspace slug.

Recommended split:

- `/account` stays personal: name, email, password, delete personal account
- `/w/[slug]/settings` becomes workspace settings: slug, workspace name, members, billing

For MVP, workspace settings can initially just contain read-only slug and membership management.

## Billing Implications

### Subscription ownership

Subscription should belong to the workspace, not the user.

Recommended fields:

- `subscriptions.workspace_id`
- `subscriptions.billing_owner_user_id` optional but useful
- `workspaces.billing_owner_user_id`

MVP behavior:

- only owner can manage billing
- admin/member can view billing status if useful, but cannot mutate it

### Trial ownership

Trial should also belong to workspace.

MVP behavior:

- one trial per workspace
- creating a new workspace starts a workspace trial
- joining an existing workspace does not create a trial

### Paddle integration

Current webhook custom data uses `user_id`. Change target to:

```json
{
  "workspace_id": "...",
  "billing_owner_user_id": "..."
}
```

Implications:

- checkout session creation must know active workspace
- webhook handlers resolve subscription rows by `workspace_id`
- trial conversion updates workspace trial, not user trial

### Workspace deletion

Recommended MVP policy:

- do not implement full self-service workspace deletion until ownership and billing cancellation semantics are explicit
- allow only internal/platform admin deletion at first, or owner deletion only when:
  - subscription is canceled or absent
  - membership consequences are clearly communicated

Safer MVP:

- defer workspace deletion UI entirely

### Future limits

If limits are added later, they should apply to workspace-owned resources, not user-owned resources.

Examples:

- member seats per workspace
- number of product resources per workspace
- feature access by workspace plan

Plan for this now by keeping plan/trial/subscription attached to workspace.

## Admin and Reporting Implications

The current admin area is user-centric. It will need a workspace lens.

### Recommended admin views

- Users
- Workspaces
- Memberships
- Trials
- Subscriptions
- Pending invites

### Reporting changes

Current joins such as "profile + subscription + trial by `user_id`" will become misleading.

Recommended reporting pivots:

- user report: user identity + number of workspaces + platform role
- workspace report: workspace slug/name + owner + member count + trial/subscription status
- subscription report: subscription by workspace + billing owner
- trial report: trial by workspace + owner/billing owner

### Internal operations

Admin tooling should be able to answer:

- which workspace owns this subscription?
- which users belong to this workspace?
- who is the owner?
- does this user belong to multiple workspaces?

## Recommended MVP Scope

Keep the first milestone intentionally narrow.

### Include

- first-class `workspaces`
- `workspace_memberships`
- `workspace_invites`
- workspace-owned trials
- workspace-owned subscriptions
- workspace-scoped billing reads and actions
- owner/admin/member authorization
- member list
- invite by email
- accept invite after auth
- remove member
- owner-only role change
- workspace switcher

### Defer

- ownership transfer
- self-service workspace deletion
- seat-based billing enforcement
- SCIM/SAML
- invite resend history and audit logs
- custom roles
- cross-workspace global search
- domain-based auto-join

This scope is pragmatic because it solves the real multi-user need without forcing the codebase into enterprise-grade account administration immediately.

## Ordered Rollout in Phases / PRs

## Phase 0: Design and inventory

- catalog every place that assumes `user_id == account/workspace`
- identify route/API surfaces that need workspace context
- decide final URL strategy and invite email UX

Deliverable:

- approved schema and route plan

## Phase 1: Schema introduction and backfill-safe migration

- add `workspaces`
- add `workspace_memberships`
- add `workspace_invites`
- add nullable `workspace_id` to `subscriptions` and `trials`
- add nullable `default_workspace_id` to `profiles`
- keep existing `profiles.account_slug`, `subscriptions.user_id`, and `trials.user_id` temporarily

Backfill:

- create one workspace per existing profile using `profiles.account_slug`
- set `workspaces.owner_user_id = profiles.user_id`
- create owner membership for each existing user
- copy `subscriptions.user_id -> workspace_id`
- copy `trials.user_id -> workspace_id`
- set `profiles.default_workspace_id`

Deliverable:

- dual-written schema state with legacy columns still present

## Phase 2: Workspace resolution helpers and read-path cutover

- add domain helpers for current workspace lookup and membership checks
- update protected pages to resolve active workspace
- redirect `/dashboard` and `/billing` to workspace-scoped routes
- move billing/trial reads from `user_id` to `workspace_id`
- keep legacy routes temporarily as adapters

Deliverable:

- product reads become workspace-aware without yet exposing invites

## Phase 3: Signup and onboarding cutover

- update signup flow to create workspace + owner membership + workspace trial
- move slug uniqueness check from `profiles` to `workspaces`
- keep personal profile creation as-is otherwise

Deliverable:

- all new accounts use the new model

## Phase 4: Membership and invite MVP

- add workspace members page
- add invite creation + invite acceptance
- add member removal
- add owner-only role management
- add workspace switcher

Deliverable:

- real multi-user collaboration for customer accounts

## Phase 5: Billing action cutover

- make checkout include `workspace_id`
- update Paddle webhook handling to rely on `workspace_id`
- update cancel/reactivate/payment-method routes to require owner role on current workspace
- update billing UI copy to refer to workspace plan ownership

Deliverable:

- billing becomes fully workspace-owned

## Phase 6: Admin/reporting cutover

- add workspace-centric reporting
- update existing admin tables and joins
- expose memberships and workspace summaries

Deliverable:

- internal tooling reflects the new model accurately

## Phase 7: Legacy cleanup

- remove `profiles.account_slug`
- remove `subscriptions.user_id` once no longer needed
- remove `trials.user_id` once no longer needed
- tighten constraints so `workspace_id` is `not null`
- finalize RLS policies around membership-based access

Deliverable:

- clean steady-state schema

## Migration and Backfill Risks

### 1. Slug uniqueness collisions or malformed historical data

Risk:

- existing `profiles.account_slug` may contain values that are valid today but problematic once promoted to a standalone workspace namespace

Mitigation:

- audit slugs before backfill
- add a pre-migration validation script/report
- decide a deterministic remediation rule for collisions if any exist

### 2. Dual-write drift during transition

Risk:

- if old code continues writing user-scoped rows while new code writes workspace-scoped rows, records can diverge

Mitigation:

- keep the transition window short
- prefer cutover by feature area rather than long-term dual maintenance
- add temporary consistency checks in admin tooling or scripts

### 3. Billing webhook mismatch

Risk:

- old subscriptions may still emit webhook payloads with only `user_id`

Mitigation:

- during transition, support resolving `workspace_id` from either webhook `workspace_id` or legacy `user_id`
- remove fallback only after all active subscriptions are migrated

### 4. User deletion edge cases

Risk:

- deleting a user who owns a workspace can orphan the workspace or its billing ownership

Mitigation:

- block deletion for owners in MVP unless ownership transfer/admin override is handled
- add explicit owner-checks before `auth.admin.deleteUser`

### 5. Invite email mismatch

Risk:

- authenticated user email may not match invite email

Mitigation:

- enforce exact email match for MVP
- show a clear error and require sign-in with the invited address

### 6. Authorization regressions

Risk:

- routes that were safe under one-user-per-account assumptions may expose cross-workspace data after the migration

Mitigation:

- centralize workspace resolution helpers
- audit every billing/admin/member route for membership checks
- prefer route params over hidden state

## Open Questions

1. Should every signup still create exactly one workspace, or should the product eventually support user accounts before workspace creation?
2. Should workspace slug remain immutable for MVP, as it effectively is today?
3. Should admins be allowed to invite/promote other admins, or should that stay owner-only initially?
4. Should non-owners be able to view billing status, or should billing be owner-only end to end?
5. What should happen if the owner accepts an invite to another workspace and later deletes their personal account?
6. Do future product entities also need `workspace_id` now, or can that wait until memberships land?
7. Are there existing Paddle customers whose subscription metadata would need manual repair during cutover?

## Recommended Final Direction

Adopt a first-class `workspaces` + `workspace_memberships` model, keep `profiles` strictly user-scoped, and migrate trials/subscriptions from `user_id` ownership to `workspace_id` ownership.

For this codebase, the safest MVP is:

- create exactly one workspace at signup
- add route-based active workspace selection
- support owner/admin/member roles
- support invite/accept/remove/member-list flows
- make billing workspace-owned but owner-managed
- defer ownership transfer and workspace deletion until after the migration stabilizes

That gives you real team support without forcing a total rewrite of the current auth, billing, and admin foundations.
