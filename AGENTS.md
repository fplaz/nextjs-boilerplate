# AGENTS.md

This file provides guidance to AI dev agents when working with code in this repository.

## Architecture

**Next.js 16 App Router** with React 19, TypeScript (strict), Tailwind CSS 4, and Supabase.

### Supabase clients (`src/lib/supabase/`)

Three client factories, each for a different context:
- `server.ts` — `createClient()` for server components and server actions (cookie-based sessions)
- `client.ts` — `createClient()` for client components (browser client)
- `admin.ts` — `createAdminClient()` using secret key (bypasses RLS, used only for admin operations like account deletion)

### Auth & route protection

- **Proxy** (`src/proxy.ts`) validates sessions via `supabase.auth.getUser()` (not `getSession()` — this is intentional
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

JSON API endpoints that call the same domain services. The proxy excludes `/api/` from auth redirects — each route
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

### Testing

- **Test runner**: Vitest (see `vitest.config.ts`).
- **Test discovery**: Tests live **only** in `__tests__` folders under `src`, not next to source files.
  - Examples:
    - `src/components/__tests__/form-message.test.tsx`
    - `src/components/ui/__tests__/button.test.tsx`
    - `src/domain/auth/__tests__/auth.schema.test.ts`
    - `src/lib/__tests__/utils.test.ts`
- **Vitest include pattern**: `test.include` is set to `["src/**/__tests__/**/*.{test,spec}.{ts,tsx}"]`. When adding new tests, keep this layout so they are discovered.
- **Imports inside tests**:
  - Prefer the `@` alias to reference `src` when it makes paths clearer (e.g. `@/lib/utils`, `@/components/ui/button`).
  - When testing a module in the same area, you can also use relative imports from the `__tests__` folder (e.g. `../form-message`, `../auth.schema`).
- **Where to put new tests**:
  - For a file under `src/components`, add or update tests in `src/components/__tests__/`.
  - For a file under `src/components/ui`, use `src/components/ui/__tests__/`.
  - For a domain entity (e.g. auth), use `src/domain/<entity>/__tests__/`.
  - For shared libraries under `src/lib`, use `src/lib/__tests__/`.
- **How to run tests**:
  - Use `npm test` (runs `vitest run`) for CI-style runs.
  - Use `npm run test:watch` for interactive development.

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

### CI/CD

A GitHub Actions workflow (`.github/workflows/supabase-deploy.yml`) automatically runs `supabase db push` on every push to
`main`. It requires two repository secrets: `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF`. Do **not** run `supabase db push`
manually in production — let the pipeline handle it.

## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands.

Core workflow:

1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes