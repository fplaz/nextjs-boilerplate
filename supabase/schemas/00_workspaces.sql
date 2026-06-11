create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  billing_owner_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'active',
  logo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;
