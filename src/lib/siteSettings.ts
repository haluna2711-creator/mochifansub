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

/* ---------- Nền trang cổng (/gate) ---------- */

export interface GateBackground {
  /** Link ảnh nền của trang cổng. Rỗng = dùng ảnh mặc định. */
  url: string;
  /** Độ tối của lớp phủ màu lên ảnh, 0–80 (cao hơn → chữ trắng dễ đọc hơn). */
  overlay: number;
}

export const GATE_BG_KEY = "gate_background";
export const DEFAULT_GATE_BACKGROUND: GateBackground = { url: "", overlay: 30 };
export const GATE_DEFAULT_IMAGE = "/assets/default-bg.png";

export function sanitizeGateBackground(raw: unknown): GateBackground {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return { url: cleanBackgroundUrl(r.url), overlay: num(r.overlay, 0, 80, DEFAULT_GATE_BACKGROUND.overlay) };
}

/** Lớp phủ màu hồng đậm, đậm hơn ở đỉnh và đáy để tiêu đề và nút cuộn luôn rõ. */
export function gateOverlayCss(overlay: number): string {
  const a = Math.min(80, Math.max(0, overlay)) / 100;
  const top = Math.min(0.9, a * 0.85).toFixed(3);
  const bottom = Math.min(0.9, a * 1.3).toFixed(3);
  return `linear-gradient(to bottom, rgba(122,60,80,${top}) 0%, rgba(122,60,80,0) 50%, rgba(122,60,80,${bottom}) 100%)`;
}

async function loadGateBackground(): Promise<GateBackground> {
  const sb = getServerSupabase();
  if (!sb) return DEFAULT_GATE_BACKGROUND;
  const { data, error } = await sb.from("site_settings").select("value").eq("key", GATE_BG_KEY).maybeSingle();
  if (error || !data) return DEFAULT_GATE_BACKGROUND;
  return sanitizeGateBackground(data.value);
}

// Đổi ở admin sẽ hiện ở trang cổng sau tối đa 60 giây
export const getGateBackground = unstable_cache(loadGateBackground, ["gate-background"], { revalidate: 60 });
