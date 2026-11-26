-- =====================================================================
--  Mochi Fansub — Supabase schema
--  Chạy toàn bộ file này trong Supabase Dashboard → SQL Editor → New query
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Bảng phim / bộ anime
-- ---------------------------------------------------------------------
create table if not exists public.releases (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  title_jp       text,
  synopsis       text,
  cover_url      text,
  banner_url     text,
  genres         text[] not null default '{}',
  year           int,
  season         text,                -- Đông / Xuân / Hạ / Thu
  status         text not null default 'ongoing'
                 check (status in ('ongoing', 'completed', 'upcoming')),
  total_episodes int,
  featured       boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists releases_updated_idx  on public.releases (updated_at desc);
create index if not exists releases_featured_idx on public.releases (featured) where featured;
create index if not exists releases_genres_idx   on public.releases using gin (genres);

-- ---------------------------------------------------------------------
-- Bảng link torrent (mỗi phim đúng 1 dòng)
-- ---------------------------------------------------------------------
create table if not exists public.torrents (
  id          uuid primary key default gen_random_uuid(),
  release_id  uuid not null references public.releases (id) on delete cascade,
  label       text not null,          -- "Tập 01", "Batch 01-12"...
  episode     numeric,                -- dùng để sắp xếp
  quality     text,                   -- 1080p / 720p / 4K
  size        text,                   -- "1.4 GB"
  sub_type    text default 'Softsub', -- Softsub / Hardsub
  magnet      text,
  torrent_url text,
  created_at  timestamptz not null default now(),
  constraint torrents_has_link check (magnet is not null or torrent_url is not null)
);

-- Mỗi phim chỉ có đúng 1 link torrent
alter table public.torrents drop constraint if exists torrents_one_per_release;
alter table public.torrents add constraint torrents_one_per_release unique (release_id);
create index if not exists torrents_created_idx on public.torrents (created_at desc);

-- ---------------------------------------------------------------------
-- Danh sách admin (user_id lấy từ Authentication → Users)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- Tự động cập nhật updated_at; thêm torrent mới sẽ đẩy phim lên đầu
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists releases_touch on public.releases;
create trigger releases_touch before update on public.releases
for each row execute function public.touch_updated_at();

create or replace function public.bump_release_on_torrent()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.releases set updated_at = now() where id = new.release_id;
  return new;
end $$;

drop trigger if exists torrents_bump on public.torrents;
create trigger torrents_bump after insert or update on public.torrents
for each row execute function public.bump_release_on_torrent();

-- ---------------------------------------------------------------------
-- Row Level Security: ai cũng đọc được, chỉ admin được ghi
-- ---------------------------------------------------------------------
alter table public.releases enable row level security;
alter table public.torrents enable row level security;
alter table public.admins   enable row level security;

drop policy if exists "public read releases" on public.releases;
create policy "public read releases" on public.releases for select using (true);
drop policy if exists "admin write releases" on public.releases;
create policy "admin write releases" on public.releases for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read torrents" on public.torrents;
create policy "public read torrents" on public.torrents for select using (true);
drop policy if exists "admin write torrents" on public.torrents;
create policy "admin write torrents" on public.torrents for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read self" on public.admins;
create policy "admin read self" on public.admins for select using (user_id = auth.uid());

-- Cho phép Data API truy cập bảng (quyền ghi vẫn do RLS ở trên quyết định)
grant usage on schema public to anon, authenticated;
grant select on public.releases, public.torrents to anon, authenticated;
grant insert, update, delete on public.releases, public.torrents to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Storage bucket cho ảnh poster / banner
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "public read covers" on storage.objects;
create policy "public read covers" on storage.objects for select
  using (bucket_id = 'covers');

drop policy if exists "admin upload covers" on storage.objects;
create policy "admin upload covers" on storage.objects for insert
  with check (bucket_id = 'covers' and public.is_admin());

drop policy if exists "admin update covers" on storage.objects;
create policy "admin update covers" on storage.objects for update
  using (bucket_id = 'covers' and public.is_admin());

drop policy if exists "admin delete covers" on storage.objects;
create policy "admin delete covers" on storage.objects for delete
  using (bucket_id = 'covers' and public.is_admin());

-- ---------------------------------------------------------------------
-- SAU KHI tạo tài khoản admin (Authentication → Users → Add user),
-- chạy dòng dưới với email của bạn để cấp quyền admin:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'ban@example.com';
-- ---------------------------------------------------------------------
