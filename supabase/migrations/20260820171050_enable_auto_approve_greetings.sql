alter table public.greetings
  alter column is_approved set default true;

drop policy if exists "guests can submit greetings" on public.greetings;

create policy "guests can submit approved greetings"
on public.greetings
for insert
to anon, authenticated
with check (
  is_approved
  and exists (
    select 1
    from public.invitations i
    where i.id = invitation_id
      and i.status = 'published'
  )
);

update public.greetings
set is_approved = true
where not is_approved;
