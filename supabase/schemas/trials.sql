create table public.trials (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  status text not null default 'active',
  plan text not null default 'Basic',
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '5 days'),
  two_day_warning_sent boolean not null default false,
  one_day_warning_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trials enable row level security;

create policy "Users can read own trial"
  on public.trials for select to authenticated
  using (
    exists (
      select 1
      from public.workspace_memberships
      where workspace_memberships.workspace_id = trials.workspace_id
        and workspace_memberships.user_id = auth.uid()
        and workspace_memberships.status = 'active'
    )
  );
