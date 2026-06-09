create table public.trials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'active',       -- 'active' | 'expired' | 'converted'
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
  using (auth.uid() = user_id);
