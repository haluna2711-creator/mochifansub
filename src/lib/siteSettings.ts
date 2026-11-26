import type { CSSProperties } from "react";
import { unstable_cache } from "next/cache";
import { getServerSupabase } from "./supabase";

export interface SiteBackground {
  /** Link ảnh nền (http/https hoặc đường dẫn bắt đầu bằng "/"). Rỗng = dùng nền mặc định. */
  url: string;
  repeatX: boolean;
  repeatY: boolean;
  /** Độ mờ của ảnh nền, 0–100 (100 = rõ hoàn toàn). */
  opacity: number;
  /** Kích thước mỗi ô ảnh khi lặp (px). 0 = giữ kích thước gốc. */
  tileSize: number;
}

export const BG_KEY = "background";

export const DEFAULT_BACKGROUND: SiteBackground = {
  url: "",
  repeatX: false,
  repeatY: false,
  opacity: 100,
  tileSize: 0,
};

/** Chỉ cho phép link http(s) hoặc đường dẫn nội bộ; loại ký tự có thể phá cú pháp CSS. */
export function cleanBackgroundUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const v = raw.trim();
  if (!v || v.length > 2000 || /[\s"'()\\<>]/.test(v)) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
};

export function sanitizeBackground(raw: unknown): SiteBackground {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    url: cleanBackgroundUrl(r.url),
    repeatX: r.repeatX === true,
    repeatY: r.repeatY === true,
    opacity: num(r.opacity, 0, 100, DEFAULT_BACKGROUND.opacity),
    tileSize: num(r.tileSize, 0, 2000, 0),
  };
}

/** Chuyển cấu hình thành style CSS dùng chung cho trang thật và bản xem trước trong admin. */
export function backgroundStyle(bg: SiteBackground): CSSProperties {
  const repeating = bg.repeatX || bg.repeatY;
  return {
    backgroundImage: bg.url ? `url("${bg.url}")` : undefined,
    backgroundRepeat: bg.repeatX && bg.repeatY ? "repeat" : bg.repeatX ? "repeat-x" : bg.repeatY ? "repeat-y" : "no-repeat",
    backgroundSize: !repeating ? "cover" : bg.tileSize > 0 ? `${bg.tileSize}px auto` : "auto",
    backgroundPosition: repeating ? "top left" : "center",
    opacity: bg.opacity / 100,
  };
}

async function loadBackground(): Promise<SiteBackground> {
  const sb = getServerSupabase();
  if (!sb) return DEFAULT_BACKGROUND;
  const { data, error } = await sb.from("site_settings").select("value").eq("key", BG_KEY).maybeSingle();
  // Chưa chạy supabase/add-site-settings.sql → dùng nền mặc định, không làm hỏng trang
  if (error || !data) return DEFAULT_BACKGROUND;
  return sanitizeBackground(data.value);
}

// Đổi ở admin sẽ hiện trên trang sau tối đa 60 giây
export const getBackground = unstable_cache(loadBackground, ["site-background"], { revalidate: 60 });
