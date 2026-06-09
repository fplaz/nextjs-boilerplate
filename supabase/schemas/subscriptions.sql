create table public.subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
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

create index idx_subscriptions_user_id on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);
