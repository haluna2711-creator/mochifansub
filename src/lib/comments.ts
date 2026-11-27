export interface PublicComment {
  id: string;
  author_name: string;
  content: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
  /** Link ảnh đại diện của người bình luận (nếu có) */
  avatar_url?: string | null;
}

export const COMMENT_MAX = 1000;
export const COMMENT_MIN = 2;
export const NAME_MAX = 40;
export const DEFAULT_NAME = "Khách ăn bánh";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Bỏ ký tự điều khiển, gọn khoảng trắng; React tự escape khi hiển thị nên không cần lọc HTML. */
export function cleanText(raw: unknown, max: number, multiline: boolean): string {
  if (typeof raw !== "string") return "";
  let v = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮]/g, "");
  v = multiline ? v.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n") : v.replace(/\s+/g, " ");
  return v.trim().slice(0, max);
}
