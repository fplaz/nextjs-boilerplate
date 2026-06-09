create table public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  status text not null default 'active',
  invited_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index idx_workspace_memberships_user_id
  on public.workspace_memberships(user_id);

create index idx_workspace_memberships_workspace_id
  on public.workspace_memberships(workspace_id);

alter table public.workspace_memberships enable row level security;

create policy "Members can read own workspaces"
  on public.workspaces for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_memberships
      where workspace_memberships.workspace_id = workspaces.id
        and workspace_memberships.user_id = auth.uid()
        and workspace_memberships.status = 'active'
    )
  );

create policy "Members can read workspace memberships"
  on public.workspace_memberships for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_memberships as viewer
      where viewer.workspace_id = workspace_memberships.workspace_id
        and viewer.user_id = auth.uid()
        and viewer.status = 'active'
    )
  );
