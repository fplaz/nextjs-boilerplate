-- Create profiles table
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account_slug text not null unique,
  first_name text,
  last_name text,
  role text not null default 'user',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);