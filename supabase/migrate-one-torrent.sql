-- =====================================================================
--  Chuyển sang chế độ "mỗi phim chỉ 1 link torrent"
--  Chạy file này 1 lần trong Supabase → SQL Editor (nếu bạn đã chạy schema.sql cũ).
-- =====================================================================

-- 1) Nếu phim nào đang có nhiều link, chỉ giữ lại link mới nhất
delete from public.torrents t
using public.torrents newer
where t.release_id = newer.release_id
  and (t.created_at, t.id) < (newer.created_at, newer.id);

-- 2) Chặn thêm link thứ hai cho cùng 1 phim
drop index if exists public.torrents_release_idx;
alter table public.torrents drop constraint if exists torrents_one_per_release;
alter table public.torrents add constraint torrents_one_per_release unique (release_id);

-- 3) Sửa link cũng đẩy phim lên mục "Mới cập nhật"
drop trigger if exists torrents_bump on public.torrents;
create trigger torrents_bump after insert or update on public.torrents
for each row execute function public.bump_release_on_torrent();
