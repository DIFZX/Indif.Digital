-- Dashboard client menggunakan magic link unik, tanpa akun atau password.
create table if not exists public.invitation_dashboard_access (
  invitation_id uuid primary key references public.invitations(id) on delete cascade,
  access_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now()
);

alter table public.invitation_dashboard_access enable row level security;
revoke all on table public.invitation_dashboard_access from public, anon, authenticated;
grant select on table public.invitation_dashboard_access to authenticated;

drop policy if exists "admins can read dashboard access tokens"
  on public.invitation_dashboard_access;
create policy "admins can read dashboard access tokens"
on public.invitation_dashboard_access
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles as admin
    where admin.id = (select auth.uid())
  )
);

insert into public.invitation_dashboard_access (invitation_id)
select invitation.id
from public.invitations as invitation
on conflict (invitation_id) do nothing;

create or replace function public.create_invitation_dashboard_access()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.invitation_dashboard_access (invitation_id)
  values (new.id)
  on conflict (invitation_id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_invitation_dashboard_access
  on public.invitations;
create trigger create_invitation_dashboard_access
after insert on public.invitations
for each row execute function public.create_invitation_dashboard_access();

create or replace function public.verify_invitation_dashboard_access(
  target_slug text,
  dashboard_token text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.invitations as invitation
    join public.invitation_dashboard_access as access
      on access.invitation_id = invitation.id
    where invitation.slug = target_slug
      and invitation.status = 'published'
      and access.access_token::text = dashboard_token
  );
$$;

create or replace function public.get_invitation_dashboard_data(
  target_invitation_id uuid,
  dashboard_token text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when exists (
      select 1
      from public.invitation_dashboard_access as access
      where access.invitation_id = target_invitation_id
        and access.access_token::text = dashboard_token
    )
    then jsonb_build_object(
      'greetings',
      coalesce(
        (
          select jsonb_agg(greeting_row order by greeting_row.created_at desc)
          from (
            select
              greeting.id,
              greeting.guest_name,
              greeting.message,
              greeting.attendance,
              greeting.created_at
            from public.greetings as greeting
            where greeting.invitation_id = target_invitation_id
          ) as greeting_row
        ),
        '[]'::jsonb
      ),
      'rsvps',
      coalesce(
        (
          select jsonb_agg(rsvp_row order by rsvp_row.created_at desc)
          from (
            select
              rsvp.id,
              rsvp.guest_name,
              rsvp.attendance,
              rsvp.guest_count,
              rsvp.created_at
            from public.rsvps as rsvp
            where rsvp.invitation_id = target_invitation_id
          ) as rsvp_row
        ),
        '[]'::jsonb
      ),
      'view_count',
      (
        select count(*)
        from public.invitation_views as invitation_view
        where invitation_view.invitation_id = target_invitation_id
      )
    )
    else null
  end;
$$;

revoke all on function public.create_invitation_dashboard_access() from public;
revoke all on function public.verify_invitation_dashboard_access(text, text) from public;
revoke all on function public.get_invitation_dashboard_data(uuid, text) from public;

grant execute on function public.verify_invitation_dashboard_access(text, text)
  to anon, authenticated;
grant execute on function public.get_invitation_dashboard_data(uuid, text)
  to anon, authenticated;
