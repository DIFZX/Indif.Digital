begin;

-- These existing website designs previously appeared only through local fallback
-- data. Register their catalog entries so the sales CMS can manage them too.
-- Existing rows retain their visibility, status, content and identifiers.
insert into public.templates (
  slug, name, theme, is_active, catalog_status, description, thumbnail_path,
  preview_path, sort_order
) values
(
  'mustard-black', 'Mustard Black',
  '{"primary":"#d4a359","background":"#141211"}'::jsonb,
  true, 'available',
  'Template mewah bernuansa matte black & mustard gold dengan bingkai arch lengkung botanis, animasi scroll anggun, dan fitur digital lengkap.',
  '/media/mockups/mockup-mustard-black.webp',
  '/mustard-black?to=Tamu%20Undangan', 5
),
(
  'sunda-vibes', 'Sunda Vibes',
  '{"primary":"#A87B57","secondary":"#7A5436","accent":"#C19C8E","background":"#FFF5ED"}'::jsonb,
  true, 'available',
  'Template adat Sunda modern bernuansa Warm Bronze & Ivory dengan ornamen Mahkota Siger, bingkai lengkung floral, alunan kecapi suling, dan animasi scroll dinamis.',
  '/media/mockups/mockup-sunda-vibes-v4-1.webp',
  '/sunda-vibes?to=Tamu%20Undangan', 7
)
on conflict (slug) do nothing;

commit;
