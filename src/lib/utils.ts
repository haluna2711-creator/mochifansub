import type { ReleaseStatus } from "./types";

/** Bỏ dấu tiếng Việt + chữ thường, dùng cho tìm kiếm và slug. */
export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function slugify(s: string) {
  return normalize(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  const min = diff / 60;
  if (min < 60) return `${Math.floor(min)} phút trước`;
  const hr = min / 60;
  if (hr < 24) return `${Math.floor(hr)} giờ trước`;
  const day = hr / 24;
  if (day < 30) return `${Math.floor(day)} ngày trước`;
  const month = day / 30;
  if (month < 12) return `${Math.floor(month)} tháng trước`;
  return `${Math.floor(month / 12)} năm trước`;
}

export const STATUS_LABEL: Record<ReleaseStatus, string> = {
  ongoing: "Đang hấp",
  completed: "Bánh đủ vị",
  upcoming: "Sắp ra mắt",
};

/** Màu pastel ổn định theo chuỗi (dùng cho ảnh bìa giữ chỗ). */
export function hueFrom(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) % 360;
  return h;
}

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
