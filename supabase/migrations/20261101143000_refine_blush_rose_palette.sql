-- Refresh presentation only; wedding data, customer theme overrides, and
-- catalogue activation status are preserved.
update public.templates
set theme = coalesce(theme, '{}'::jsonb) || '{"primary":"#b51e40","accent":"#f4aec7","background":"#fff0f6"}'::jsonb,
    description = 'Tema minimalis romantis bernuansa pink dan merah mawar, dengan bingkai lengkung, ilustrasi floral, serta animasi lembut.'
where slug = 'blush-rose';
