create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null,
  token_hash text not null unique,
  invited_by_user_id uuid not null references auth.users(id) on delete cascade,
  accepted_by_user_id uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index idx_workspace_invites_active_unique
  on public.workspace_invites(workspace_id, lower(email))
  where accepted_at is null and revoked_at is null;

create index idx_workspace_invites_workspace_id
  on public.workspace_invites(workspace_id);

alter table public.workspace_invites enable row level security;

create policy "Members can read workspace invites"
  on public.workspace_invites for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_memberships
      where workspace_memberships.workspace_id = workspace_invites.workspace_id
        and workspace_memberships.user_id = auth.uid()
        and workspace_memberships.status = 'active'
    )
  );
