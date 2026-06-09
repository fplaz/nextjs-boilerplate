create table public.account_logos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  storage_path text not null,
  file_name text not null,
  created_at timestamptz default now() not null
);

alter table public.account_logos enable row level security;

create policy "Users can read own logos"
  on public.account_logos for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own logos"
  on public.account_logos for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own logos"
  on public.account_logos for delete
  to authenticated
  using (auth.uid() = user_id);
