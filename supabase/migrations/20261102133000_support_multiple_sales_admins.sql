begin;

-- A login name identifies exactly one administrator, regardless of letter case.
create unique index admin_profiles_username_lower_unique
  on public.admin_profiles (lower(username));

-- Username-to-email resolution is private to the application server. Browsers
-- cannot enumerate Auth identities or grant themselves an administrator role.
create function public.resolve_sales_admin_login(login_username text)
returns table (user_id uuid, email text)
language sql stable security definer set search_path = '' as $$
  select profile.id, account.email::text
  from public.admin_profiles as profile
  join auth.users as account on account.id = profile.id
  where lower(profile.username) = lower(btrim(login_username))
    and profile.role = 'sales'
    and account.email_confirmed_at is not null
  limit 1;
$$;

revoke all on function public.resolve_sales_admin_login(text) from public, anon, authenticated;
grant execute on function public.resolve_sales_admin_login(text) to service_role;

commit;
