alter table public.profiles
  add column if not exists public_location text,
  add column if not exists public_skills text,
  add column if not exists public_tagline text,
  add column if not exists profile_background_color text not null default '#ffffff';
