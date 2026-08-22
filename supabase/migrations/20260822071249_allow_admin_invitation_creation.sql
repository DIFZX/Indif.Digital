grant insert on table public.invitations to authenticated;

create policy "admins can create invitations"
on public.invitations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_profiles as admin
    where admin.id = (select auth.uid())
  )
);
