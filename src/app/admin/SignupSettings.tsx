"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SIGNUP, SIGNUP_KEY, sanitizeSignup } from "@/lib/siteSettings";
import { IconX } from "@/components/Icons";
import { Spinner } from "./ui";

export function SignupSettings({ sb, onClose }: { sb: SupabaseClient; onClose: () => void }) {
  const [enabled, setEnabled] = useState(DEFAULT_SIGNUP.enabled);
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
      .eq("key", SIGNUP_KEY)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        if (data) setEnabled(sanitizeSignup(data.value).enabled);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [sb]);

  /** Lưu ngay khi bật/tắt (có hiệu lực tức thì, không bị cache 60 giây). */
  const toggle = async () => {
    if (busy) return;
    const next = !enabled;
    setBusy(true);
    setMsg(null);
    const { error } = await sb
      .from("site_settings")
      .upsert({ key: SIGNUP_KEY, value: { enabled: next }, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setBusy(false);
    if (error) {
      const missing = /site_settings|relation|schema cache/i.test(error.message);
      return setMsg({
        ok: false,
        text: missing ? "Chưa có bảng site_settings — hãy chạy supabase/add-site-settings.sql trong Supabase → SQL Editor." : error.message,
      });
    }
    setEnabled(next);
    setMsg({ ok: true, text: next ? "Đã MỞ đăng ký — khách mới có thể tạo tài khoản." : "Đã ĐÓNG đăng ký — không ai tạo được tài khoản mới." });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button type="button" aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative flex h-full w-full max-w-xl flex-col bg-bg shadow-2xl md:rounded-l-[2rem]"
        style={{ animation: "rise .45s var(--ease-mochi) both" }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-black">Đăng ký thành viên mới</h2>
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
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-line">
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">{enabled ? "Đang mở đăng ký" : "Đang đóng đăng ký"}</p>
                  <p className="text-sm text-muted">
                    {enabled ? "Khách mới có thể tạo tài khoản ở trang cổng." : "Trang cổng ẩn form đăng ký, chỉ thành viên cũ đăng nhập được."}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label="Bật hoặc tắt đăng ký mới"
                  disabled={busy}
                  onClick={toggle}
                  className={`press relative h-8 w-14 shrink-0 rounded-full transition disabled:opacity-60 ${enabled ? "bg-matcha" : "bg-line"}`}
                >
                  <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${enabled ? "left-7" : "left-1"}`} />
                </button>
              </div>

              <p className="text-xs text-muted">
                Công tắc có hiệu lực ngay và chỉ ảnh hưởng người chưa có tài khoản; thành viên cũ vẫn đăng nhập, quên mật khẩu bình thường.
                Giới hạn khách mỗi ngày (nếu có) vẫn áp dụng khi đăng ký đang mở.
              </p>

              {msg && (
                <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${msg.ok ? "bg-matcha/20 text-matcha-deep" : "bg-red-500/10 text-red-600 dark:text-red-300"}`}>
                  {msg.text}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
