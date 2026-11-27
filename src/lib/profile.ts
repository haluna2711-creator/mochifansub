export const PROFILE_EVENT = "mochi-profile-updated";
export const AVATAR_MAX = 500;

export interface MyProfile {
  username: string;
  avatar_url: string | null;
}

/** Thông báo lỗi theo mã mà hàm update_my_profile trả về */
export const PROFILE_ERRORS: Record<string, string> = {
  no_user: "Phiên đăng nhập đã hết, hãy đăng nhập lại.",
  bad_name: "Tên hiển thị cần từ 2 đến 40 ký tự.",
  reserved: "Tên này dành riêng cho tiệm, hãy chọn tên khác.",
  taken: "Tên này đã có người dùng. Hãy chọn tên khác.",
  bad_avatar: "Link ảnh không hợp lệ. Hãy dán link bắt đầu bằng https://",
};

/** Kiểm tra link ảnh ở trình duyệt (DB kiểm tra lại lần nữa). Để trống = bỏ ảnh. */
export function checkAvatarUrl(raw: string): { ok: true; url: string | null } | { ok: false } {
  const v = raw.trim();
  if (!v) return { ok: true, url: null };
  if (v.length > AVATAR_MAX) return { ok: false };
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" || u.username || u.password) return { ok: false };
    return { ok: true, url: v };
  } catch {
    return { ok: false };
  }
}
