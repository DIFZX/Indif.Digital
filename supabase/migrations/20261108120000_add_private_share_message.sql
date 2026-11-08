begin;

alter table public.invitation_dashboard_access
  add column if not exists share_message_template text
  check (share_message_template is null or (char_length(share_message_template) <= 6000 and share_message_template !~ '^[[:space:]]*$'));

create or replace function public.save_invitation_share_message(
  target_slug text,
  dashboard_token text,
  message_template text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if message_template is null or message_template ~ '^[[:space:]]*$' or char_length(message_template) > 6000 then
    return false;
  end if;

  update public.invitation_dashboard_access as access
  set share_message_template = message_template
  from public.invitations as invitation
  where access.invitation_id = invitation.id
    and invitation.slug = target_slug
    and invitation.status = 'published'
    and access.access_token::text = dashboard_token;
  return found;
end;
$$;

revoke all on function public.save_invitation_share_message(text, text, text) from public;
grant execute on function public.save_invitation_share_message(text, text, text) to anon, authenticated;

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
      select 1 from public.invitation_dashboard_access as access
      where access.invitation_id = target_invitation_id
        and access.access_token::text = dashboard_token
    )
    then jsonb_build_object(
      'greetings', coalesce((
        select jsonb_agg(greeting_row order by greeting_row.created_at desc)
        from (
          select greeting.id, greeting.guest_name, greeting.message, greeting.attendance, greeting.created_at
          from public.greetings as greeting
          where greeting.invitation_id = target_invitation_id
        ) as greeting_row
      ), '[]'::jsonb),
      'rsvps', coalesce((
        select jsonb_agg(rsvp_row order by rsvp_row.created_at desc)
        from (
          select rsvp.id, rsvp.guest_name, rsvp.attendance, rsvp.guest_count, rsvp.created_at
          from public.rsvps as rsvp
          where rsvp.invitation_id = target_invitation_id
        ) as rsvp_row
      ), '[]'::jsonb),
      'view_count', (select count(*) from public.invitation_views where invitation_id = target_invitation_id),
      'share_message_template', (
        select access.share_message_template from public.invitation_dashboard_access as access
        where access.invitation_id = target_invitation_id
      )
    )
    else null
  end;
$$;

revoke all on function public.get_invitation_dashboard_data(uuid, text) from public;
grant execute on function public.get_invitation_dashboard_data(uuid, text) to anon, authenticated;

commit;
