-- =============================================================
-- FideliCard · Schema completo v1  (FRESH START — borra y recrea)
-- Aplicar en: Supabase Dashboard → SQL Editor → Run
-- =============================================================

-- ─────────────────────────────────────────
-- EXTENSIONES
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- LIMPIAR ESTADO PREVIO
-- (tablas en orden inverso de dependencia)
-- ─────────────────────────────────────────
drop trigger  if exists on_auth_user_created   on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;

drop table if exists public.audit_log     cascade;
drop table if exists public.receipts      cascade;
drop table if exists public.purchases     cascade;
drop table if exists public.qr_links      cascade;
drop table if exists public.loyalty_cards cascade;
drop table if exists public.card_configs  cascade;
drop table if exists public.profiles      cascade;

-- Storage policies (idempotente)
drop policy if exists "avatars: user uploads own"   on storage.objects;
drop policy if exists "avatars: user updates own"   on storage.objects;
drop policy if exists "avatars: public read"        on storage.objects;
drop policy if exists "logos: business writes own"  on storage.objects;
drop policy if exists "logos: business updates own" on storage.objects;
drop policy if exists "logos: public read"          on storage.objects;
drop policy if exists "receipts: owner reads"       on storage.objects;
drop policy if exists "receipts: owner writes"      on storage.objects;

-- ─────────────────────────────────────────
-- TABLA: profiles
-- ─────────────────────────────────────────
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  name            text not null default '',
  role            text not null default 'client'
                    check (role in ('client', 'business')),
  avatar_url      text,
  phone           text,
  public_bio      text,
  public_slug     text unique,
  is_public_bio   boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Trigger: perfil automático al registrar usuario
create function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at genérico
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────
-- TABLA: card_configs
-- ─────────────────────────────────────────
create table public.card_configs (
  id                uuid        primary key default gen_random_uuid(),
  business_id       uuid        not null unique references public.profiles(id) on delete cascade,
  business_name     text        not null default '',
  color_hex         text        not null default '#3525cd',
  total_stamps      integer     not null default 10 check (total_stamps >= 1),
  reward_description text       not null default 'Producto gratis',
  logo_url          text,
  description       text,
  category          text,
  address           text,
  website           text,
  program_type      text        not null default 'stamp_based'
                                  check (program_type in ('stamp_based', 'accumulative')),
  amount_per_point  numeric(12,2),
  updated_at        timestamptz not null default now()
);

create trigger card_configs_updated_at
  before update on public.card_configs
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────
-- TABLA: loyalty_cards
-- ─────────────────────────────────────────
create table public.loyalty_cards (
  id                 uuid        primary key default gen_random_uuid(),
  business_id        uuid        not null references public.profiles(id) on delete cascade,
  client_id          uuid        not null references public.profiles(id) on delete cascade,
  current_stamps     integer     not null default 0 check (current_stamps >= 0),
  total_stamps       integer     not null check (total_stamps >= 1),
  business_name      text        not null default '',
  color_hex          text        not null default '#3525cd',
  reward_description text        not null default '',
  created_at         timestamptz not null default now(),
  unique (business_id, client_id)
);

-- ─────────────────────────────────────────
-- TABLA: purchases
-- ─────────────────────────────────────────
create table public.purchases (
  id              uuid        primary key default gen_random_uuid(),
  loyalty_card_id uuid        references public.loyalty_cards(id) on delete set null,
  business_id     uuid        references public.profiles(id) on delete set null,
  client_id       uuid        references public.profiles(id) on delete set null,
  business_name   text,
  amount          numeric(12,2),
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- TABLA: receipts
-- ─────────────────────────────────────────
create table public.receipts (
  id               uuid        primary key default gen_random_uuid(),
  business_id      uuid        not null references public.profiles(id) on delete cascade,
  client_id        uuid        not null references public.profiles(id) on delete cascade,
  loyalty_card_id  uuid        references public.loyalty_cards(id) on delete set null,
  storage_path     text        not null,
  perceptual_hash  text        not null,
  content_hash     text        not null,
  ocr_payload      jsonb       not null default '{}',
  source           text        not null check (source in ('client', 'business')),
  created_at       timestamptz not null default now(),
  unique (business_id, content_hash)
);

-- ─────────────────────────────────────────
-- TABLA: qr_links
-- ─────────────────────────────────────────
create table public.qr_links (
  slug         text        primary key,
  business_id  uuid        not null references public.profiles(id) on delete cascade,
  target_url   text        not null,
  target_type  text        not null default 'register-purchase',
  payload      jsonb       not null default '{}',
  active       boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger qr_links_updated_at
  before update on public.qr_links
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────
-- TABLA: audit_log
-- ─────────────────────────────────────────
create table public.audit_log (
  id         uuid        primary key default gen_random_uuid(),
  actor_id   uuid,
  action     text        not null,
  entity     text,
  entity_id  uuid,
  payload    jsonb       default '{}',
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.card_configs  enable row level security;
alter table public.loyalty_cards enable row level security;
alter table public.purchases     enable row level security;
alter table public.receipts      enable row level security;
alter table public.qr_links      enable row level security;
alter table public.audit_log     enable row level security;

-- profiles: cualquier usuario autenticado puede leer (necesario para búsqueda de empresas)
create policy "profiles: authenticated read all"
  on public.profiles for select to authenticated using (true);

create policy "profiles: user updates own"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- card_configs: lectura pública, escritura solo del dueño
create policy "card_configs: public read"
  on public.card_configs for select to anon, authenticated using (true);

create policy "card_configs: business insert"
  on public.card_configs for insert to authenticated
  with check (auth.uid() = business_id);

create policy "card_configs: business update"
  on public.card_configs for update to authenticated
  using (auth.uid() = business_id) with check (auth.uid() = business_id);

-- loyalty_cards
create policy "loyalty_cards: business reads clients"
  on public.loyalty_cards for select to authenticated
  using (auth.uid() = business_id);

create policy "loyalty_cards: client reads own"
  on public.loyalty_cards for select to authenticated
  using (auth.uid() = client_id);

-- purchases
create policy "purchases: business reads own"
  on public.purchases for select to authenticated
  using (auth.uid() = business_id);

create policy "purchases: client reads own"
  on public.purchases for select to authenticated
  using (auth.uid() = client_id);

-- receipts
create policy "receipts: owner reads"
  on public.receipts for select to authenticated
  using (auth.uid() = client_id or auth.uid() = business_id);

create policy "receipts: owner inserts"
  on public.receipts for insert to authenticated
  with check (auth.uid() = client_id or auth.uid() = business_id);

-- qr_links: lectura pública, escritura solo dueño
create policy "qr_links: public read"
  on public.qr_links for select to anon, authenticated using (true);

create policy "qr_links: business insert"
  on public.qr_links for insert to authenticated
  with check (auth.uid() = business_id);

create policy "qr_links: business update"
  on public.qr_links for update to authenticated
  using (auth.uid() = business_id) with check (auth.uid() = business_id);

-- ─────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',  'avatars',  true,  2097152,  array['image/jpeg','image/png','image/webp']),
  ('logos',    'logos',    true,  2097152,  array['image/jpeg','image/png','image/webp']),
  ('receipts', 'receipts', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ─────────────────────────────────────────
-- STORAGE POLICIES
-- ─────────────────────────────────────────
-- avatars
create policy "avatars: user uploads own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: user updates own"
  on storage.objects for update to authenticated
  using  (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');

-- logos
create policy "logos: business writes own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "logos: business updates own"
  on storage.objects for update to authenticated
  using  (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "logos: public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'logos');

-- receipts (privado)
create policy "receipts: owner reads"
  on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "receipts: owner writes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
