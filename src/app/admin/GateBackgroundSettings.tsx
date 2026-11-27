"use client";

import { useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_GATE_BACKGROUND,
  GATE_BG_KEY,
  GATE_DEFAULT_IMAGE,
  cleanBackgroundUrl,
  gateOverlayCss,
  sanitizeGateBackground,
  type GateBackground,
} from "@/lib/siteSettings";
import { IconX } from "@/components/Icons";
import { Button, Field, Spinner, inputCls } from "./ui";
import { uploadToStorage } from "./ReleaseEditor";

const MAX_SIDE = 2000;

/** Thu nhỏ ảnh về tối đa 2000px và nén JPEG để trang cổng tải nhanh (ảnh chụp điện thoại thường rất nặng). */
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Chỉ nhận ảnh JPG, PNG hoặc WebP.");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.type === "image/jpeg" && file.size <= 1.5 * 1024 * 1024) {
    bmp.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không xử lý được ảnh.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86));
  if (!blob) throw new Error("Không nén được ảnh.");
  return new File([blob], "gate-bg.jpg", { type: "image/jpeg" });
}

export function GateBackgroundSettings({ sb, onClose }: { sb: SupabaseClient; onClose: () => void }) {
  const [bg, setBg] = useState<GateBackground>(DEFAULT_GATE_BACKGROUND);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      .eq("key", GATE_BG_KEY)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        if (data) setBg(sanitizeGateBackground(data.value));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [sb]);

  const urlInvalid = bg.url.trim() !== "" && cleanBackgroundUrl(bg.url) === "";
  const shownUrl = cleanBackgroundUrl(bg.url) || GATE_DEFAULT_IMAGE;

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const small = await shrink(file);
      const url = await uploadToStorage(sb, small, "gate");
      setBg((s) => ({ ...s, url }));
      setMsg({ ok: true, text: "Đã tải ảnh lên. Bấm “Lưu nền cổng” để áp dụng." });
    } catch (e) {
      setMsg({ ok: false, text: `Tải ảnh lỗi: ${(e as Error).message}` });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInvalid) return setMsg({ ok: false, text: "Link ảnh không hợp lệ (cần bắt đầu bằng https:// và không chứa khoảng trắng)." });
    setBusy(true);
    setMsg(null);
    const value = sanitizeGateBackground(bg);
    const { error } = await sb
      .from("site_settings")
      .upsert({ key: GATE_BG_KEY, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setBusy(false);
    if (error) {
      const missing = /site_settings|relation|schema cache/i.test(error.message);
      return setMsg({
        ok: false,
        text: missing ? "Chưa có bảng site_settings — hãy chạy supabase/add-site-settings.sql trong Supabase → SQL Editor." : error.message,
      });
    }
    setBg(value);
    setMsg({ ok: true, text: "Đã lưu! Trang cổng sẽ cập nhật sau tối đa 60 giây." });
  };

  const reset = () => {
    setBg(DEFAULT_GATE_BACKGROUND);
    setMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button type="button" aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative flex h-full w-full max-w-xl flex-col bg-bg shadow-2xl md:rounded-l-[2rem]"
        style={{ animation: "rise .45s var(--ease-mochi) both" }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-black">Nền trang cổng</h2>
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
                <div className="relative grid h-56 place-items-center overflow-hidden rounded-2xl bg-[#f6d9de] ring-1 ring-line">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${shownUrl}")` }} />
                  <div className="absolute inset-0" style={{ backgroundImage: gateOverlayCss(bg.overlay) }} />
                  <p className="relative px-4 text-center font-display text-3xl font-black text-white drop-shadow-[0_2px_16px_rgba(120,60,80,.6)]">
                    Tiệm Bánh Mochi
                  </p>
                </div>
                {!cleanBackgroundUrl(bg.url) && <p className="mt-1.5 text-xs text-muted">Đang dùng ảnh mặc định của tiệm.</p>}
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-muted">Tải ảnh từ máy</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => upload(e.target.files?.[0])}
                  className="hidden"
                />
                <Button type="button" variant="matcha" disabled={uploading || busy} onClick={() => fileRef.current?.click()}>
                  {uploading && <Spinner />} {uploading ? "Đang tải…" : "Chọn ảnh"}
                </Button>
                <span className="mt-1.5 block text-xs text-muted">
                  JPG, PNG hoặc WebP. Ảnh lớn sẽ tự được thu nhỏ về tối đa 2000px cho nhẹ. Nên chọn ảnh ngang hoặc vuông, ít chữ ở giữa.
                </span>
              </div>

              <Field label="Hoặc dán link ảnh" hint="Bỏ trống để dùng ảnh mặc định.">
                <input
                  className={inputCls}
                  type="url"
                  inputMode="url"
                  placeholder="https://…/anh-nen.jpg"
                  value={bg.url}
                  onChange={(e) => setBg((s) => ({ ...s, url: e.target.value }))}
                />
                {urlInvalid && <span className="mt-1 block text-xs font-semibold text-red-600 dark:text-red-300">Link không hợp lệ.</span>}
              </Field>

              <Field label={`Độ tối lớp phủ: ${bg.overlay}%`} hint="Tăng lên nếu ảnh sáng làm chữ trắng khó đọc · 0% = chỉ có ảnh, không phủ màu.">
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={1}
                  value={bg.overlay}
                  onChange={(e) => setBg((s) => ({ ...s, overlay: Number(e.target.value) }))}
                  className="w-full accent-[var(--sakura-deep)]"
                />
              </Field>

              {msg && (
                <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${msg.ok ? "bg-matcha/20 text-matcha-deep" : "bg-red-500/10 text-red-600 dark:text-red-300"}`}>
                  {msg.text}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={busy || uploading || urlInvalid}>
                  {busy && <Spinner />} Lưu nền cổng
                </Button>
                <Button type="button" variant="ghost" onClick={reset} disabled={busy || uploading}>
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
