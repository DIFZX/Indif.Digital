alter table public.greetings
add column if not exists attendance public.attendance_status;

update public.greetings as g
set attendance = (
  select r.attendance
  from public.rsvps as r
  where r.invitation_id = g.invitation_id
    and lower(btrim(r.guest_name)) = lower(btrim(g.guest_name))
  order by r.created_at desc
  limit 1
)
where g.attendance is null
  and exists (
    select 1
    from public.rsvps as r
    where r.invitation_id = g.invitation_id
      and lower(btrim(r.guest_name)) = lower(btrim(g.guest_name))
  );
