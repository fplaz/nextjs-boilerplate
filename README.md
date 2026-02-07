# QR Coder

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
cd qr-coder
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
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

## Deployment

Pushing to `main` triggers a GitHub Action that deploys database migrations to Supabase via `supabase db push`.

**Required GitHub secrets** (Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | [Personal access token](https://supabase.com/dashboard/account/tokens) from the Supabase dashboard |
| `SUPABASE_DB_PASSWORD` | Database password for your Supabase project |
| `SUPABASE_PROJECT_REF` | Project reference (from the URL: `https://app.supabase.com/project/<ref>`) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
