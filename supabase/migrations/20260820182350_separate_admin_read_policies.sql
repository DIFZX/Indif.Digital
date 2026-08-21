drop policy if exists "active templates are public" on public.templates;
create policy "active templates are public"
on public.templates
for select
to anon
using (is_active);

drop policy if exists "published invitations are public" on public.invitations;
create policy "published invitations are public"
on public.invitations
for select
to anon
using (status = 'published');

drop policy if exists "approved greetings are public" on public.greetings;
create policy "approved greetings are public"
on public.greetings
for select
to anon
using (is_approved);
