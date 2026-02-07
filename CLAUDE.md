# CLAUDE.md

 This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

 ## Architecture

 **Next.js 16 App Router** with React 19, TypeScript (strict), Tailwind CSS 4, and Supabase.

 ### Supabase clients (`src/lib/supabase/`)

 Three client factories, each for a different context:
 - `server.ts` — `createClient()` for server components and server actions (cookie-based sessions)
 - `client.ts` — `createClient()` for client components (browser client)
 - `admin.ts` — `createAdminClient()` using service role key (bypasses RLS, used only for admin operations like account deletion)

 ### Auth & route protection

 - **Middleware** (`src/middleware.ts`) validates sessions via `supabase.auth.getUser()` (not `getSession()` — this is intentional
 for security). Unauthenticated users are redirected to `/login`; authenticated users are redirected away from auth pages.
 - **Email verification** is handled by `/auth/confirm` route handler which processes OTP tokens for signup, recovery, and email
 change flows.

 ### Domain layer (`src/domain/`)

 Business logic lives in `src/domain/`, organized by entity. Each entity has:
 - `*.schema.ts` — Zod schemas for input validation + exported inferred TypeScript types.
 - `*.service.ts` — Plain functions that receive a Supabase client, parse input with Zod, call Supabase, and return
 `{ data, error }`. No redirects, no HTTP concerns.

 ### Server actions pattern

 Server actions in `src/app/actions/` are **thin wrappers** around domain services:
 - Parse `FormData` into a plain object.
 - Call the corresponding domain service function.
 - Redirect based on `result.error` or `result.data`.

 They contain zero business logic, validation, or direct database access.

 Error/success feedback uses **redirect with URL query params** (`?error=` or `?message=`), displayed by the `FormMessage`
 component which reads from `searchParams`.

 ### API routes (`src/app/api/`)

 JSON API endpoints that call the same domain services. Middleware excludes `/api/` from auth redirects — each route
 self-protects by calling `getUser()` where needed.

 Response format: `{ data }` on success, `{ error: string }` on failure.

 ### Route groups

 - `src/app/(protected)/` — authenticated routes, wrapped with `NavBar` + centered layout via its `layout.tsx`
 - Auth pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`) are public.

 ### Client-side data fetching

 Client components may fetch or mutate data, but must always go through API routes (`/api/…`) — never call Supabase directly
 from the browser. This keeps the Supabase client confined to the server and ensures auth validation happens in one place.

 ### UI components

 shadcn/ui (new-york style) with Radix UI primitives. Components live in `src/components/ui/`. Icons from `lucide-react`. Add new
 shadcn components with `npx shadcn@latest add <component>`.

 ### Database (declarative schemas)

 Schema files live in `supabase/schemas/` — one `.sql` file per table/entity. Lexicographic file order matters because
 foreign-key references must appear after the referenced table. `supabase/config.toml` sets `schema_paths = ["./schemas/*.sql"]`
 so the CLI knows where to find them.

 **Migrations are generated, never hand-written.** After editing a schema file, run:

 ```bash
 supabase db diff -f <migration_name>
 ```

 This compares the declared schemas against the local database and writes a new migration to `supabase/migrations/`.

 Some features are **not supported** by declarative diff and still require versioned migrations written manually:
 RLS policies, DML (`INSERT`/`UPDATE`/`DELETE`), triggers, functions, materialized views, and publications.

 **No database functions.** All business logic lives in the application layer (`src/domain/`), not in Postgres functions.
 **Avoid triggers** unless absolutely necessary — prefer handling side effects in application code.

 Common commands:
 - `supabase db diff -f <name>` — generate a migration from schema changes
 - `supabase migration up` — apply pending migrations to the local database
 - `supabase db push` — push migrations to the linked remote project