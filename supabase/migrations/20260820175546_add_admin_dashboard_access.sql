create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now(),
  constraint admin_profiles_username_length check (char_length(username) between 3 and 40)
);

alter table public.admin_profiles enable row level security;

revoke all on table public.admin_profiles from anon;
grant select on table public.admin_profiles to authenticated;

create policy "admins can read their own profile"
on public.admin_profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "admins can read all templates"
on public.templates
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles as admin
    where admin.id = (select auth.uid())
  )
);

create policy "admins can read all invitations"
on public.invitations
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles as admin
    where admin.id = (select auth.uid())
  )
);

create policy "admins can read all rsvps"
on public.rsvps
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles as admin
    where admin.id = (select auth.uid())
  )
);

create policy "admins can read all greetings"
on public.greetings
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles as admin
    where admin.id = (select auth.uid())
  )
);

