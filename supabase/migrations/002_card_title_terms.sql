-- =============================================================
-- fidelink · Migration 002
-- Añade columnas extendidas a card_configs
-- Aplicar en: Supabase Dashboard → SQL Editor → Run
-- =============================================================

alter table public.card_configs
  add column if not exists card_title       text,
  add column if not exists terms_of_service text,
  add column if not exists email            text,
  add column if not exists instagram        text,
  add column if not exists facebook         text,
  add column if not exists card_tag         text default 'Loyalty';
