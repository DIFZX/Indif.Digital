-- Migration: Izinkan pembacaan RSVP untuk undangan yang berstatus published
-- Dijalankan agar dashboard klien dan kalkulasi kehadiran dapat membaca data dari Supabase

drop policy if exists "rsvps of published invitations are readable" on public.rsvps;

create policy "rsvps of published invitations are readable"
on public.rsvps
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.invitations as i
    where i.id = rsvps.invitation_id
      and i.status = 'published'
  )
);
