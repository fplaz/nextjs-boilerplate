
  create table "public"."profiles" (
    "user_id" uuid not null,
    "first_name" text,
    "last_name" text,
    "platform_role" text not null default 'user'::text,
    "default_workspace_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."subscriptions" (
    "id" bigint generated always as identity not null,
    "workspace_id" uuid not null,
    "billing_owner_user_id" uuid,
    "paddle_subscription_id" text not null,
    "paddle_customer_id" text,
    "status" text not null default 'trialing'::text,
    "paddle_product_id" text,
    "paddle_product_name" text,
    "paddle_price_id" text,
    "paddle_price_name" text,
    "paddle_price_billing_interval" text,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "scheduled_cancelation_date" timestamp with time zone,
    "trial_end" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."subscriptions" enable row level security;


  create table "public"."workspace_invites" (
    "id" uuid not null default gen_random_uuid(),
    "workspace_id" uuid not null,
    "email" text not null,
    "role" text not null,
    "token_hash" text not null,
    "invited_by_user_id" uuid not null,
    "accepted_by_user_id" uuid,
    "expires_at" timestamp with time zone not null,
    "accepted_at" timestamp with time zone,
    "revoked_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."workspace_invites" enable row level security;


  create table "public"."workspace_memberships" (
    "id" uuid not null default gen_random_uuid(),
    "workspace_id" uuid not null,
    "user_id" uuid not null,
    "role" text not null,
    "status" text not null default 'active'::text,
    "invited_by_user_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."workspace_memberships" enable row level security;


  create table "public"."workspaces" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "name" text not null,
    "owner_user_id" uuid not null,
    "billing_owner_user_id" uuid,
    "status" text not null default 'active'::text,
    "logo_path" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."workspaces" enable row level security;

CREATE INDEX idx_subscriptions_workspace_id ON public.subscriptions USING btree (workspace_id);

CREATE UNIQUE INDEX idx_workspace_invites_active_unique ON public.workspace_invites USING btree (workspace_id, lower(email)) WHERE ((accepted_at IS NULL) AND (revoked_at IS NULL));

CREATE INDEX idx_workspace_invites_workspace_id ON public.workspace_invites USING btree (workspace_id);

CREATE INDEX idx_workspace_memberships_user_id ON public.workspace_memberships USING btree (user_id);

CREATE INDEX idx_workspace_memberships_workspace_id ON public.workspace_memberships USING btree (workspace_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (user_id);

CREATE UNIQUE INDEX subscriptions_paddle_subscription_id_key ON public.subscriptions USING btree (paddle_subscription_id);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX workspace_invites_pkey ON public.workspace_invites USING btree (id);

CREATE UNIQUE INDEX workspace_invites_token_hash_key ON public.workspace_invites USING btree (token_hash);

CREATE UNIQUE INDEX workspace_memberships_pkey ON public.workspace_memberships USING btree (id);

CREATE UNIQUE INDEX workspace_memberships_workspace_id_user_id_key ON public.workspace_memberships USING btree (workspace_id, user_id);

CREATE UNIQUE INDEX workspaces_pkey ON public.workspaces USING btree (id);

CREATE UNIQUE INDEX workspaces_slug_key ON public.workspaces USING btree (slug);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."workspace_invites" add constraint "workspace_invites_pkey" PRIMARY KEY using index "workspace_invites_pkey";

alter table "public"."workspace_memberships" add constraint "workspace_memberships_pkey" PRIMARY KEY using index "workspace_memberships_pkey";

alter table "public"."workspaces" add constraint "workspaces_pkey" PRIMARY KEY using index "workspaces_pkey";

alter table "public"."profiles" add constraint "profiles_default_workspace_id_fkey" FOREIGN KEY (default_workspace_id) REFERENCES public.workspaces(id) ON DELETE SET NULL not valid;

alter table "public"."profiles" validate constraint "profiles_default_workspace_id_fkey";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_billing_owner_user_id_fkey" FOREIGN KEY (billing_owner_user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_billing_owner_user_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_paddle_subscription_id_key" UNIQUE using index "subscriptions_paddle_subscription_id_key";

alter table "public"."subscriptions" add constraint "subscriptions_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_workspace_id_fkey";

alter table "public"."workspace_invites" add constraint "workspace_invites_accepted_by_user_id_fkey" FOREIGN KEY (accepted_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."workspace_invites" validate constraint "workspace_invites_accepted_by_user_id_fkey";

alter table "public"."workspace_invites" add constraint "workspace_invites_invited_by_user_id_fkey" FOREIGN KEY (invited_by_user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_invites" validate constraint "workspace_invites_invited_by_user_id_fkey";

alter table "public"."workspace_invites" add constraint "workspace_invites_token_hash_key" UNIQUE using index "workspace_invites_token_hash_key";

alter table "public"."workspace_invites" add constraint "workspace_invites_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_invites" validate constraint "workspace_invites_workspace_id_fkey";

alter table "public"."workspace_memberships" add constraint "workspace_memberships_invited_by_user_id_fkey" FOREIGN KEY (invited_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."workspace_memberships" validate constraint "workspace_memberships_invited_by_user_id_fkey";

alter table "public"."workspace_memberships" add constraint "workspace_memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_memberships" validate constraint "workspace_memberships_user_id_fkey";

alter table "public"."workspace_memberships" add constraint "workspace_memberships_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_memberships" validate constraint "workspace_memberships_workspace_id_fkey";

alter table "public"."workspace_memberships" add constraint "workspace_memberships_workspace_id_user_id_key" UNIQUE using index "workspace_memberships_workspace_id_user_id_key";

alter table "public"."workspaces" add constraint "workspaces_billing_owner_user_id_fkey" FOREIGN KEY (billing_owner_user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."workspaces" validate constraint "workspaces_billing_owner_user_id_fkey";

alter table "public"."workspaces" add constraint "workspaces_owner_user_id_fkey" FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE RESTRICT not valid;

alter table "public"."workspaces" validate constraint "workspaces_owner_user_id_fkey";

alter table "public"."workspaces" add constraint "workspaces_slug_key" UNIQUE using index "workspaces_slug_key";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."workspace_invites" to "anon";

grant insert on table "public"."workspace_invites" to "anon";

grant references on table "public"."workspace_invites" to "anon";

grant select on table "public"."workspace_invites" to "anon";

grant trigger on table "public"."workspace_invites" to "anon";

grant truncate on table "public"."workspace_invites" to "anon";

grant update on table "public"."workspace_invites" to "anon";

grant delete on table "public"."workspace_invites" to "authenticated";

grant insert on table "public"."workspace_invites" to "authenticated";

grant references on table "public"."workspace_invites" to "authenticated";

grant select on table "public"."workspace_invites" to "authenticated";

grant trigger on table "public"."workspace_invites" to "authenticated";

grant truncate on table "public"."workspace_invites" to "authenticated";

grant update on table "public"."workspace_invites" to "authenticated";

grant delete on table "public"."workspace_invites" to "service_role";

grant insert on table "public"."workspace_invites" to "service_role";

grant references on table "public"."workspace_invites" to "service_role";

grant select on table "public"."workspace_invites" to "service_role";

grant trigger on table "public"."workspace_invites" to "service_role";

grant truncate on table "public"."workspace_invites" to "service_role";

grant update on table "public"."workspace_invites" to "service_role";

grant delete on table "public"."workspace_memberships" to "anon";

grant insert on table "public"."workspace_memberships" to "anon";

grant references on table "public"."workspace_memberships" to "anon";

grant select on table "public"."workspace_memberships" to "anon";

grant trigger on table "public"."workspace_memberships" to "anon";

grant truncate on table "public"."workspace_memberships" to "anon";

grant update on table "public"."workspace_memberships" to "anon";

grant delete on table "public"."workspace_memberships" to "authenticated";

grant insert on table "public"."workspace_memberships" to "authenticated";

grant references on table "public"."workspace_memberships" to "authenticated";

grant select on table "public"."workspace_memberships" to "authenticated";

grant trigger on table "public"."workspace_memberships" to "authenticated";

grant truncate on table "public"."workspace_memberships" to "authenticated";

grant update on table "public"."workspace_memberships" to "authenticated";

grant delete on table "public"."workspace_memberships" to "service_role";

grant insert on table "public"."workspace_memberships" to "service_role";

grant references on table "public"."workspace_memberships" to "service_role";

grant select on table "public"."workspace_memberships" to "service_role";

grant trigger on table "public"."workspace_memberships" to "service_role";

grant truncate on table "public"."workspace_memberships" to "service_role";

grant update on table "public"."workspace_memberships" to "service_role";

grant delete on table "public"."workspaces" to "anon";

grant insert on table "public"."workspaces" to "anon";

grant references on table "public"."workspaces" to "anon";

grant select on table "public"."workspaces" to "anon";

grant trigger on table "public"."workspaces" to "anon";

grant truncate on table "public"."workspaces" to "anon";

grant update on table "public"."workspaces" to "anon";

grant delete on table "public"."workspaces" to "authenticated";

grant insert on table "public"."workspaces" to "authenticated";

grant references on table "public"."workspaces" to "authenticated";

grant select on table "public"."workspaces" to "authenticated";

grant trigger on table "public"."workspaces" to "authenticated";

grant truncate on table "public"."workspaces" to "authenticated";

grant update on table "public"."workspaces" to "authenticated";

grant delete on table "public"."workspaces" to "service_role";

grant insert on table "public"."workspaces" to "service_role";

grant references on table "public"."workspaces" to "service_role";

grant select on table "public"."workspaces" to "service_role";

grant trigger on table "public"."workspaces" to "service_role";

grant truncate on table "public"."workspaces" to "service_role";

grant update on table "public"."workspaces" to "service_role";


  create policy "Users can read own profile"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can read own subscription"
  on "public"."subscriptions"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.workspace_memberships
  WHERE ((workspace_memberships.workspace_id = subscriptions.workspace_id) AND (workspace_memberships.user_id = auth.uid()) AND (workspace_memberships.status = 'active'::text)))));



  create policy "Members can read workspace invites"
  on "public"."workspace_invites"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.workspace_memberships
  WHERE ((workspace_memberships.workspace_id = workspace_invites.workspace_id) AND (workspace_memberships.user_id = auth.uid()) AND (workspace_memberships.status = 'active'::text)))));



  create policy "Members can read workspace memberships"
  on "public"."workspace_memberships"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.workspace_memberships viewer
  WHERE ((viewer.workspace_id = workspace_memberships.workspace_id) AND (viewer.user_id = auth.uid()) AND (viewer.status = 'active'::text)))));



  create policy "Members can read own workspaces"
  on "public"."workspaces"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.workspace_memberships
  WHERE ((workspace_memberships.workspace_id = workspaces.id) AND (workspace_memberships.user_id = auth.uid()) AND (workspace_memberships.status = 'active'::text)))));



