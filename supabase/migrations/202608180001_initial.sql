create extension if not exists pgcrypto;

create type public.invitation_status as enum ('draft', 'published', 'archived');
create type public.attendance_status as enum ('attending', 'not_attending', 'unsure');

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  theme jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.invitation_status not null default 'draft',
  bride_name text not null,
  bride_short_name text not null,
  bride_parents text not null default '',
  groom_name text not null,
  groom_short_name text not null,
  groom_parents text not null default '',
  event_date date not null,
  ceremony_time text not null,
  reception_time text not null,
  venue_name text not null,
  venue_address text not null,
  maps_url text,
  opening_text text not null,
  story jsonb not null default '[]'::jsonb check (jsonb_typeof(story) = 'array'),
  cover_path text not null check (cover_path like '/media/%'),
  gallery_paths text[] not null default '{}',
  music_path text check (music_path is null or music_path like '/media/%'),
  gift_info jsonb not null default '{}'::jsonb,
  theme_overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_name text not null check (char_length(guest_name) between 2 and 80),
  attendance public.attendance_status not null,
  guest_count smallint not null default 1 check (guest_count between 0 and 10),
  created_at timestamptz not null default now()
);

create table public.greetings (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_name text not null check (char_length(guest_name) between 2 and 80),
  message text not null check (char_length(message) between 1 and 500),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index invitations_public_slug_idx on public.invitations(slug) where status = 'published';
create index greetings_invitation_created_idx on public.greetings(invitation_id, created_at desc) where is_approved;
create index rsvps_invitation_idx on public.rsvps(invitation_id);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger templates_updated_at before update on public.templates for each row execute function public.set_updated_at();
create trigger invitations_updated_at before update on public.invitations for each row execute function public.set_updated_at();

alter table public.templates enable row level security;
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;
alter table public.greetings enable row level security;

create policy "active templates are public" on public.templates for select to anon, authenticated using (is_active);
create policy "published invitations are public" on public.invitations for select to anon, authenticated using (status = 'published');
create policy "guests can submit rsvp" on public.rsvps for insert to anon, authenticated with check (
  exists (select 1 from public.invitations i where i.id = invitation_id and i.status = 'published')
);
create policy "approved greetings are public" on public.greetings for select to anon, authenticated using (is_approved);
create policy "guests can submit greetings" on public.greetings for insert to anon, authenticated with check (
  is_approved = false and exists (select 1 from public.invitations i where i.id = invitation_id and i.status = 'published')
);

insert into public.templates (id, slug, name, theme) values (
  '00000000-0000-0000-0000-000000000001', 'elegant-sage', 'Elegant Sage',
  '{"primary":"#30493b","accent":"#b8915d","background":"#f5f1e8"}'::jsonb
);

insert into public.invitations (
  id, template_id, slug, status, bride_name, bride_short_name, bride_parents,
  groom_name, groom_short_name, groom_parents, event_date, ceremony_time,
  reception_time, venue_name, venue_address, maps_url, opening_text, story,
  cover_path, gallery_paths, music_path, gift_info
) values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001', 'intan-dan-difa', 'published',
  'Intan', 'Intan', 'Putri Bapak Hadi & Ibu Ratna',
  'Difa', 'Difa', 'Putra Bapak Dedi & Ibu Maya',
  '2026-12-12', '08.00 WIB', '11.00–14.00 WIB', 'Pendopo Arunika',
  'Jl. Melati No. 12, Yogyakarta', 'https://maps.google.com',
  'Dengan penuh syukur, kami mengundang Anda untuk hadir dan menjadi bagian dari hari bahagia kami.',
  '[{"year":"2021","title":"Pertama bertemu","text":"Sebuah percakapan singkat tumbuh menjadi cerita panjang."},{"year":"2024","title":"Satu tujuan","text":"Kami belajar bahwa rumah adalah seseorang, bukan sekadar tempat."},{"year":"2026","title":"Hari yang dinanti","text":"Kini kami siap memulai babak baru bersama."}]'::jsonb,
  '/media/elegant/gallery-couple-v2.png',
  array[
    '/media/invitations/intan-dan-difa/gallery/gallery-01-v1.png',
    '/media/invitations/intan-dan-difa/gallery/gallery-02-v1.png',
    '/media/invitations/intan-dan-difa/gallery/gallery-03-v1.jpeg',
    '/media/invitations/intan-dan-difa/gallery/gallery-04-v1.jpeg',
    '/media/invitations/intan-dan-difa/gallery/gallery-05-v1.jpeg'
  ],
  '/media/elegant/romantic-piano-v1.ogg',
  '{"bank":"BCA","account_number":"1234567890","account_name":"Intan"}'::jsonb
);

insert into public.greetings (invitation_id, guest_name, message, is_approved) values (
  '00000000-0000-0000-0000-000000000101', 'Keluarga Santoso',
  'Semoga menjadi keluarga yang penuh cinta, hangat, dan bahagia selalu.', true
);
