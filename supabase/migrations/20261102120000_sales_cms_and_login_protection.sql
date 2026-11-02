begin;

alter table public.templates
  add column catalog_status text not null default 'available'
  check (catalog_status in ('available', 'maintenance', 'in_progress'));

-- Preserve the existing public "Dalam Proses" state during the migration.
update public.templates set catalog_status = 'in_progress' where slug = 'royal-maroon';

-- Sales accounts cannot read customer-only records or create invitations.
-- A separate owner account can retain the existing provisioning workflow.
alter table public.admin_profiles
  add column role text not null default 'sales' check (role in ('sales', 'owner'));
revoke insert, update, delete on public.admin_profiles from anon, authenticated;

drop policy if exists "admins can update template visibility" on public.templates;
create policy "sales admins can update the catalog" on public.templates
for update to authenticated
using (exists (select 1 from public.admin_profiles where id = (select auth.uid()) and role in ('sales', 'owner')))
with check (exists (select 1 from public.admin_profiles where id = (select auth.uid()) and role in ('sales', 'owner')));

-- Even a hand-crafted REST request cannot delete a template or edit its content.
revoke insert, update, delete, truncate, references, trigger on public.templates from anon, authenticated;
grant update (is_active, catalog_status) on public.templates to authenticated;

-- Catalog visibility must never break the template relation of a sold invitation.
drop policy if exists "active templates are public" on public.templates;
create policy "public can read available or referenced templates" on public.templates
for select to anon, authenticated
using (is_active or exists (
  select 1 from public.invitations where template_id = templates.id and status = 'published'
));

drop policy if exists "published invitations are public" on public.invitations;
create policy "published invitations are public" on public.invitations
for select to anon, authenticated using (status = 'published');

-- Replace every legacy private-data admin policy with an owner-only policy.
do $$
declare target record;
begin
  for target in select * from (values
    ('invitations', 'admins can read all invitations'),
    ('rsvps', 'admins can read all rsvps'),
    ('greetings', 'admins can read all greetings'),
    ('invitation_views', 'admins can read invitation views'),
    ('invitation_dashboard_access', 'admins can read dashboard access tokens')
  ) as policies(table_name, policy_name)
  loop
    execute format('drop policy if exists %I on public.%I', target.policy_name, target.table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (exists (select 1 from public.admin_profiles where id = (select auth.uid()) and role = ''owner''))',
      target.policy_name, target.table_name
    );
  end loop;
end;
$$;

drop policy if exists "admins can create invitations" on public.invitations;
create policy "owners can create invitations" on public.invitations
for insert to authenticated
with check (exists (select 1 from public.admin_profiles where id = (select auth.uid()) and role = 'owner'));

-- This table is inaccessible to browsers, including logged-in sales accounts.
create table public.admin_login_limits (
  bucket text primary key,
  attempts integer not null check (attempts > 0),
  window_started_at timestamptz not null
);
create index admin_login_limits_expiry_idx on public.admin_login_limits(window_started_at);
alter table public.admin_login_limits enable row level security;
revoke all on public.admin_login_limits from public, anon, authenticated;

create function public.consume_admin_login_attempt(ip_hash text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare ip_attempts integer; total_attempts integer;
begin
  if ip_hash is null or ip_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid login bucket';
  end if;

  -- A database lock makes the limits atomic across all server instances.
  perform pg_catalog.pg_advisory_xact_lock(63718102);
  delete from public.admin_login_limits where window_started_at < now() - interval '1 day';

  insert into public.admin_login_limits as limits values ('ip:' || ip_hash, 1, now())
  on conflict (bucket) do update set
    attempts = case when limits.window_started_at <= now() - interval '15 minutes' then 1 else least(limits.attempts + 1, 6) end,
    window_started_at = case when limits.window_started_at <= now() - interval '15 minutes' then now() else limits.window_started_at end
  returning attempts into ip_attempts;
  -- One blocked IP cannot keep consuming the shared budget.
  if ip_attempts > 5 then return false; end if;

  insert into public.admin_login_limits as limits values ('global', 1, now())
  on conflict (bucket) do update set
    attempts = case when limits.window_started_at <= now() - interval '15 minutes' then 1 else least(limits.attempts + 1, 31) end,
    window_started_at = case when limits.window_started_at <= now() - interval '15 minutes' then now() else limits.window_started_at end
  returning attempts into total_attempts;
  return total_attempts <= 30;
end;
$$;
revoke all on function public.consume_admin_login_attempt(text) from public, anon, authenticated;
grant execute on function public.consume_admin_login_attempt(text) to service_role;

create table public.template_catalog_events (
  id bigint generated always as identity primary key,
  template_id uuid not null references public.templates(id),
  actor_id uuid references auth.users(id) on delete set null,
  previous_state jsonb not null,
  next_state jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.template_catalog_events enable row level security;
revoke all on public.template_catalog_events from public, anon, authenticated;

create function public.audit_template_catalog_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.is_active is distinct from new.is_active or old.catalog_status is distinct from new.catalog_status then
    insert into public.template_catalog_events(template_id, actor_id, previous_state, next_state)
    values (new.id, auth.uid(),
      jsonb_build_object('is_active', old.is_active, 'catalog_status', old.catalog_status),
      jsonb_build_object('is_active', new.is_active, 'catalog_status', new.catalog_status));
  end if;
  return new;
end;
$$;
revoke all on function public.audit_template_catalog_change() from public, anon, authenticated;
create trigger templates_catalog_audit after update on public.templates
for each row execute function public.audit_template_catalog_change();

commit;
