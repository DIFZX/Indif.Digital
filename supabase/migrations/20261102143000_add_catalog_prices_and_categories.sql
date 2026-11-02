begin;

alter table public.templates
  add column category text not null default 'minimalis'
    check (category in ('spesial', 'animasi', 'minimalis')),
  add column price integer not null default 70000
    check (price between 0 and 1000000000),
  add column promo_price integer default 35000,
  add constraint templates_promo_price_check
    check (promo_price is null or (promo_price >= 0 and promo_price <= price));

-- Preserve the categories and prices that the public website already displays.
update public.templates set category = case
  when slug in ('java-vibes', 'sunda-vibes', 'netflix') then 'spesial'
  when slug in ('pink-vibes', 'blue-garden') then 'animasi'
  else 'minimalis' end;
update public.templates set
  price = case category when 'spesial' then 120000 when 'animasi' then 100000 else 70000 end,
  promo_price = case category when 'spesial' then 80000 when 'animasi' then 50000 else 35000 end;

-- Content, invitation data and customer records remain outside sales access.
grant update (category, price, promo_price) on public.templates to authenticated;

create or replace function public.audit_template_catalog_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.is_active is distinct from new.is_active
    or old.catalog_status is distinct from new.catalog_status
    or old.category is distinct from new.category
    or old.price is distinct from new.price
    or old.promo_price is distinct from new.promo_price then
    insert into public.template_catalog_events(template_id, actor_id, previous_state, next_state)
    values (new.id, auth.uid(),
      jsonb_build_object('is_active', old.is_active, 'catalog_status', old.catalog_status,
        'category', old.category, 'price', old.price, 'promo_price', old.promo_price),
      jsonb_build_object('is_active', new.is_active, 'catalog_status', new.catalog_status,
        'category', new.category, 'price', new.price, 'promo_price', new.promo_price));
  end if;
  return new;
end;
$$;
revoke all on function public.audit_template_catalog_change() from public, anon, authenticated;

commit;
