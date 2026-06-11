create table public.subscriptions (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  billing_owner_user_id uuid references auth.users(id) on delete set null,
  paddle_subscription_id text unique not null,
  paddle_customer_id text,
  status text not null default 'trialing',
  paddle_product_id text,
  paddle_product_name text,
  paddle_price_id text,
  paddle_price_name text,
  paddle_price_billing_interval text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  scheduled_cancelation_date timestamptz,
  trial_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_subscriptions_workspace_id on public.subscriptions(workspace_id);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_memberships
      where workspace_memberships.workspace_id = subscriptions.workspace_id
        and workspace_memberships.user_id = auth.uid()
        and workspace_memberships.status = 'active'
    )
  );
