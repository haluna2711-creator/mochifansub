-- =====================================================================
--  Thêm mục "Nhân sự tham gia" cho mỗi phim
--  Chạy file này 1 lần trong Supabase -> SQL Editor TRƯỚC khi dùng bản code mới.
-- =====================================================================

alter table public.releases
  add column if not exists staff jsonb not null default '[]'::jsonb;

-- Dạng dữ liệu: [{"role": "Dịch", "name": "Mochi"}, {"role": "Timing", "name": "Anko"}]
