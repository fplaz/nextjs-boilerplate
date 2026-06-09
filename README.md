# LaunchKit

Next.js 16 App Router starter with Supabase auth, profile management, and a domain-driven architecture.

## Tech Stack

- **Next.js 16** (App Router, React 19, TypeScript strict)
- **Supabase** (Auth, Postgres database)
- **Tailwind CSS 4** + **shadcn/ui**
- **Zod 4** for validation

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- Supabase CLI (`npm i -g supabase`)

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd launchkit
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_SECRET_KEY` | Supabase secret key (server-only) |
| `NEXT_PUBLIC_SITE_URL` | Your app URL (e.g. `http://localhost:3000`) |

### 3. Set up the database

Link your Supabase project and push the migrations:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (protected)/    # Authenticated routes (home, account)
    actions/        # Server actions (thin wrappers around domain services)
    api/            # JSON API routes
    auth/           # Auth confirmation handler
  components/ui/    # shadcn/ui components
  domain/           # Business logic (schemas + services per entity)
  lib/supabase/     # Supabase client factories (server, client, admin)
supabase/
  schemas/          # Declarative SQL schema files (one per table)
  migrations/       # Auto-generated migrations (never hand-written)
  config.toml       # Supabase CLI config
```

## Database Workflow

Schema definitions live in `supabase/schemas/*.sql`. After editing a schema file, generate a migration:

```bash
supabase db diff -f <migration_name>
```

Apply migrations locally or push to remote:

```bash
supabase migration up      # local
supabase db push           # remote
```

## CI/CD

Pushing to `main` automatically deploys database migrations to Supabase via GitHub Actions.

Add these secrets to your repo (**Settings > Secrets and variables > Actions**):

| Secret | Where to get it |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | Your project ref from the Supabase dashboard URL |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit and integration tests with Vitest |

## Testing

- **Test runner**: Vitest
- **Location**: Tests live in `__tests__` folders colocated by area:
  - `src/components/__tests__/`
  - `src/components/ui/__tests__/`
  - `src/domain/auth/__tests__/`
  - `src/lib/__tests__/`
- **Naming**: Use `*.test.ts` / `*.test.tsx` or `*.spec.ts` / `*.spec.tsx` inside the closest `__tests__` directory to the code under test.

