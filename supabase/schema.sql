-- LZ Studio: base de datos, permisos y almacenamiento.
-- Ejecuta este archivo una vez en Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 100),
  category text not null check (char_length(category) between 1 and 40),
  source_type text not null check (source_type in ('static', 'storage')),
  source_path text,
  storage_path text,
  sort_order integer not null default 0 check (sort_order >= 0),
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  constraint gallery_source_check check (
    (source_type = 'static' and source_path is not null and storage_path is null)
    or (source_type = 'storage' and storage_path is not null and source_path is null)
  )
);

alter table public.admins enable row level security;
alter table public.gallery_items enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Admins can view their access" on public.admins;
create policy "Admins can view their access" on public.admins
for select to authenticated using (user_id = auth.uid());

drop policy if exists "Public can view visible gallery" on public.gallery_items;
create policy "Public can view visible gallery" on public.gallery_items
for select to anon, authenticated using (visible = true or public.is_admin());

drop policy if exists "Admins can insert gallery" on public.gallery_items;
create policy "Admins can insert gallery" on public.gallery_items
for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update gallery" on public.gallery_items;
create policy "Admins can update gallery" on public.gallery_items
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete gallery" on public.gallery_items;
create policy "Admins can delete gallery" on public.gallery_items
for delete to authenticated using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins upload gallery images" on storage.objects;
create policy "Admins upload gallery images" on storage.objects
for insert to authenticated with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admins update gallery images" on storage.objects;
create policy "Admins update gallery images" on storage.objects
for update to authenticated using (bucket_id = 'gallery' and public.is_admin()) with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admins delete gallery images" on storage.objects;
create policy "Admins delete gallery images" on storage.objects
for delete to authenticated using (bucket_id = 'gallery' and public.is_admin());

insert into public.gallery_items (id, title, category, source_type, source_path, sort_order, visible)
values
  ('00000000-0000-4000-8000-000000000001','Gorra con placa personalizada','Gorras','static','/assets/gorra-caballo-roja.jpeg',10,true),
  ('00000000-0000-4000-8000-000000000002','Pedido de playeras deportivas','Playeras','static','/assets/playeras-longhorns.jpeg',20,true),
  ('00000000-0000-4000-8000-000000000003','Gorra con acabado a color','Gorras','static','/assets/gorra-aguila.jpeg',30,true),
  ('00000000-0000-4000-8000-000000000004','Playera deportiva personalizada','Playeras','static','/assets/playera-shadow-football.jpeg',40,true),
  ('00000000-0000-4000-8000-000000000005','Gorra con placa y sticker','Gorras','static','/assets/gorra-niners.jpeg',50,true),
  ('00000000-0000-4000-8000-000000000006','Playera con impresión DTF','Playeras','static','/assets/playera-buzz.jpeg',60,true),
  ('00000000-0000-4000-8000-000000000007','Gorra personalizada en vinil','Gorras','static','/assets/gorra-yuchai-negra.jpeg',70,true),
  ('00000000-0000-4000-8000-000000000008','Gorra trucker personalizada','Gorras','static','/assets/gorra-yuchai-trucker.jpeg',80,true)
on conflict (id) do nothing;

-- Después de crear el usuario administrador en Authentication > Users,
-- reemplaza el correo y ejecuta esta instrucción:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'tu-correo@dominio.com'
-- on conflict (user_id) do nothing;
