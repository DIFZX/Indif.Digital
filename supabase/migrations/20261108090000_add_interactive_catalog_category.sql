begin;

alter table public.templates
  drop constraint if exists templates_category_check,
  add constraint templates_category_check
    check (category in ('spesial', 'animasi', 'minimalis', 'interactive'));

update public.templates set category = 'interactive'
where slug = 'adventure-wedding-pixel' and category <> 'interactive';

commit;
