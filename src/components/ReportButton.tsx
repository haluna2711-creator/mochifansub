"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TYPES = [
  "Link tải bị hỏng",
  "Hết seed / tải rất chậm",
  "Sai hoặc thiếu phụ đề",
  "Sai tên / thông tin bánh",
  "Lỗi khác",
];

const field =
  "w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink ring-1 ring-line outline-none transition placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-sakura";

function FlagIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </svg>
  );
}

export function ReportButton({
  title,
  detail,
}: {
  /** Tên bánh (phim) đang xem */
  title: string;
  /** Thông tin bản tải, ví dụ "Trọn bộ · 720p · Hardsub · 16GB" */
  detail?: string;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(TYPES[0]);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // ô ẩn chống bot
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  function close() {
    setOpen(false);
    if (status === "done") {
      setStatus("idle");
      setMessage("");
      setContact("");
      setType(TYPES[0]);
    }
    setError("");
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    areaRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          detail,
          pageUrl: window.location.href,
          type,
          message,
          contact,
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Không gửi được báo lỗi, thử lại sau nhé");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi được báo lỗi, thử lại sau nhé");
      setStatus("idle");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sakura-deep/30 bg-surface px-3.5 py-1.5 text-xs font-bold text-sakura-deep transition-colors hover:bg-sakura/20"
      >
        <FlagIcon />
        Báo lỗi bánh
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[80] grid place-items-center p-4">
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={close} aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Báo lỗi bánh"
              className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-surface p-6 shadow-2xl ring-1 ring-line"
            >
              <button
                type="button"
                onClick={close}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-muted hover:text-ink"
                aria-label="Đóng"
              >
                ✕
              </button>

              {status === "done" ? (
                <div className="py-6 text-center">
                  <p className="text-4xl" aria-hidden>
                    🍡
                  </p>
                  <h3 className="mt-3 font-display text-xl font-black">Đã gửi báo lỗi!</h3>
                  <p className="mt-2 text-sm text-muted">Cảm ơn bạn, tiệm sẽ kiểm tra lại mẻ bánh này sớm nhất.</p>
                  <button
                    type="button"
                    onClick={close}
                    className="press mt-6 inline-flex h-11 items-center rounded-full bg-sakura-deep px-7 text-sm font-extrabold text-white hover:brightness-110"
                  >
                    Xong
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="pr-10">
                    <h3 className="font-display text-xl font-black">Báo lỗi bánh</h3>
                    <p className="mt-1 text-sm text-muted">
                      <b className="text-ink">{title}</b>
                      {detail ? ` · ${detail}` : ""}
                    </p>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-muted">Loại lỗi</span>
                    <select className={field} value={type} onChange={(e) => setType(e.target.value)}>
                      {TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-muted">Mô tả lỗi</span>
                    <textarea
                      ref={areaRef}
                      className={`${field} min-h-28 resize-y`}
                      value={message}
                      maxLength={2000}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Bạn gặp lỗi gì? Ví dụ: bấm Magnet không mở được, file tải về bị lỗi…"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-muted">
                      Email của bạn <span className="font-normal">(không bắt buộc, để tiệm báo lại khi sửa xong)</span>
                    </span>
                    <input
                      type="email"
                      className={field}
                      value={contact}
                      maxLength={200}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="ban@example.com"
                    />
                  </label>

                  {/* Ô ẩn chống bot: người thật không thấy, không điền */}
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />

                  {error && (
                    <p role="alert" className="rounded-2xl bg-sakura/20 px-4 py-2.5 text-sm font-semibold text-sakura-deep">
                      {error}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={close}
                      className="press inline-flex h-11 items-center rounded-full bg-surface-2 px-5 text-sm font-extrabold ring-1 ring-line hover:bg-surface"
                    >
                      Huỷ
                    </button>
                    <button
                      type="submit"
                      disabled={status === "sending" || message.trim().length < 5}
                      className="press inline-flex h-11 items-center gap-2 rounded-full bg-sakura-deep px-6 text-sm font-extrabold text-white shadow-[0_8px_20px_-10px] shadow-sakura-deep hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {status === "sending" ? "Đang gửi…" : "Gửi báo lỗi"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
