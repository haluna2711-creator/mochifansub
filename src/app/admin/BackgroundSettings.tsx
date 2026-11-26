"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BG_KEY,
  DEFAULT_BACKGROUND,
  backgroundStyle,
  cleanBackgroundUrl,
  sanitizeBackground,
  type SiteBackground,
} from "@/lib/siteSettings";
import { IconX } from "@/components/Icons";
import { Button, Field, Spinner, inputCls } from "./ui";

export function BackgroundSettings({ sb, onClose }: { sb: SupabaseClient; onClose: () => void }) {
  const [bg, setBg] = useState<SiteBackground>(DEFAULT_BACKGROUND);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    sb.from("site_settings")
      .select("value")
      .eq("key", BG_KEY)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        if (data) setBg(sanitizeBackground(data.value));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [sb]);

  const set = <K extends keyof SiteBackground>(k: K, v: SiteBackground[K]) => setBg((s) => ({ ...s, [k]: v }));

  const urlInvalid = bg.url.trim() !== "" && cleanBackgroundUrl(bg.url) === "";
  const repeating = bg.repeatX || bg.repeatY;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInvalid) return setMsg({ ok: false, text: "Link ảnh không hợp lệ (cần bắt đầu bằng https:// và không chứa khoảng trắng)." });
    setBusy(true);
    setMsg(null);
    const value = sanitizeBackground(bg);
    const { error } = await sb
      .from("site_settings")
      .upsert({ key: BG_KEY, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setBusy(false);
    if (error) {
      const missing = /site_settings|relation|schema cache/i.test(error.message);
      return setMsg({
        ok: false,
        text: missing ? "Chưa có bảng site_settings — hãy chạy supabase/add-site-settings.sql trong Supabase → SQL Editor." : error.message,
      });
    }
    setBg(value);
    setMsg({ ok: true, text: "Đã lưu! Trang chủ sẽ cập nhật sau tối đa 60 giây." });
  };

  const reset = () => {
    setBg(DEFAULT_BACKGROUND);
    setMsg(null);
  };

  const previewBg = { ...bg, url: cleanBackgroundUrl(bg.url) };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button type="button" aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative flex h-full w-full max-w-xl flex-col bg-bg shadow-2xl md:rounded-l-[2rem]"
        style={{ animation: "rise .45s var(--ease-mochi) both" }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-black">Nền trang web</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="press ml-auto grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-line">
            <IconX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          {loading ? (
            <div className="grid place-items-center py-24 text-sakura-deep">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <form onSubmit={save} className="space-y-6">
              <div>
                <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-muted">Xem trước</span>
                <div className="relative h-48 overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-line">
                  {previewBg.url ? (
                    <div className="absolute inset-0" style={backgroundStyle(previewBg)} />
                  ) : (
                    <p className="grid h-full place-items-center px-4 text-center text-sm text-muted">Chưa có ảnh nền — trang đang dùng nền mặc định</p>
                  )}
                </div>
              </div>

              <Field label="Link ảnh nền" hint="Dán link trực tiếp tới file ảnh (.jpg, .png, .webp…). Bỏ trống để dùng nền mặc định.">
                <input
                  className={inputCls}
                  type="url"
                  inputMode="url"
                  placeholder="https://…/anh-nen.jpg"
                  value={bg.url}
                  onChange={(e) => set("url", e.target.value)}
                />
                {urlInvalid && <span className="mt-1 block text-xs font-semibold text-red-600 dark:text-red-300">Link không hợp lệ.</span>}
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
                  <input type="checkbox" checked={bg.repeatX} onChange={(e) => set("repeatX", e.target.checked)} className="h-5 w-5 accent-[var(--sakura-deep)]" />
                  <span>
                    <span className="block text-sm font-bold">Lặp ngang</span>
                    <span className="block text-xs text-muted">Nhân ảnh theo chiều ngang</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
                  <input type="checkbox" checked={bg.repeatY} onChange={(e) => set("repeatY", e.target.checked)} className="h-5 w-5 accent-[var(--sakura-deep)]" />
                  <span>
                    <span className="block text-sm font-bold">Lặp dọc</span>
                    <span className="block text-xs text-muted">Nhân ảnh theo chiều dọc</span>
                  </span>
                </label>
              </div>

              {repeating ? (
                <Field label="Kích thước mỗi ô ảnh (px)" hint="0 = giữ kích thước gốc của ảnh.">
                  <input
                    className={inputCls}
                    type="number"
                    min={0}
                    max={2000}
                    step={10}
                    value={bg.tileSize}
                    onChange={(e) => set("tileSize", Math.min(2000, Math.max(0, Number(e.target.value) || 0)))}
                  />
                </Field>
              ) : (
                <p className="rounded-2xl bg-surface-2 px-4 py-3 text-xs text-muted">Không bật lặp → ảnh được phóng vừa kín toàn màn hình, canh giữa.</p>
              )}

              <Field label={`Độ mờ nền: ${bg.opacity}%`} hint="100% = ảnh rõ hoàn toàn · thấp hơn = ảnh nhạt dần, nội dung dễ đọc hơn.">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={bg.opacity}
                  onChange={(e) => set("opacity", Number(e.target.value))}
                  className="w-full accent-[var(--sakura-deep)]"
                />
              </Field>

              {msg && (
                <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${msg.ok ? "bg-matcha/20 text-matcha-deep" : "bg-red-500/10 text-red-600 dark:text-red-300"}`}>
                  {msg.text}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={busy || urlInvalid}>
                  {busy && <Spinner />} Lưu nền
                </Button>
                <Button type="button" variant="ghost" onClick={reset} disabled={busy}>
                  Về mặc định
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
