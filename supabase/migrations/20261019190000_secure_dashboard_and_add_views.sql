-- Dashboard RSVP berisi data pribadi dan hanya boleh dibaca administrator.
drop policy if exists "rsvps of published invitations are readable" on public.rsvps;
revoke select on table public.rsvps from anon;

create table if not exists public.invitation_views (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  constraint invitation_views_unique_visitor unique (invitation_id, visitor_id)
);

create index if not exists invitation_views_invitation_idx
  on public.invitation_views (invitation_id);

alter table public.invitation_views enable row level security;
revoke all on table public.invitation_views from public, anon, authenticated;
grant select on table public.invitation_views to authenticated;

drop policy if exists "admins can read invitation views" on public.invitation_views;
create policy "admins can read invitation views"
on public.invitation_views
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles as admin
    where admin.id = (select auth.uid())
  )
);

create or replace function public.record_invitation_view(
  target_invitation_id uuid,
  target_visitor_id uuid
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.invitation_views (invitation_id, visitor_id)
  select target_invitation_id, target_visitor_id
  where exists (
    select 1
    from public.invitations
    where id = target_invitation_id
      and status = 'published'
  )
  on conflict (invitation_id, visitor_id) do nothing;
$$;

revoke all on function public.record_invitation_view(uuid, uuid) from public;
grant execute on function public.record_invitation_view(uuid, uuid) to anon, authenticated;

alter table public.invitations
  drop constraint if exists invitations_maps_url_https_check,
  add constraint invitations_maps_url_https_check
    check (maps_url is null or maps_url ~ '^https://');

alter table public.templates
  drop constraint if exists templates_preview_path_check,
  add constraint templates_preview_path_check
    check (preview_path is null or preview_path ~* '^/[a-z0-9][a-z0-9/?=&%._-]*$');
