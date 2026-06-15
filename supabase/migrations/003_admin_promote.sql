-- =============================================================
-- Fidelia Hub · Promover usuario a Administrador
-- =============================================================
-- 1. Primero: permite 'admin' en la tabla profiles (ejecutar UNA VEZ)
-- 2. Segundo: promueve el usuario indicado
-- =============================================================

-- ── PASO 1: Ampliar CHECK constraint de profiles (solo necesario si no existe)
-- ──
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('client', 'business', 'admin'));

-- ── PASO 2: Promover un email a ADMINISTRADOR
-- ── REEMPLAZA 'tu@email.com' con tu correo real antes de ejecutar
-- ──
do $$
declare
  _uid uuid;
begin
  select id into _uid from auth.users where email = 'tu@email.com';
  if _uid is null then
    raise exception 'No se encontró usuario con ese email';
  end if;

  -- 2a. Actualiza metadata en Auth (esto permite acceso a módulos + admin)
  update auth.users
  set raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb
  where id = _uid;

  -- 2b. Actualiza el rol en la tabla profiles (para upserts futuros)
  update public.profiles
  set role = 'admin'
  where id = _uid;

  raise notice 'Usuario % promovido a admin exitosamente', 'tu@email.com';
end;
$$;
