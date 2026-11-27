"use client";

import { useCallback, useEffect, useState } from "react";
import { COMMENT_MAX, NAME_MAX, type PublicComment } from "@/lib/comments";
import { hueFrom, timeAgo } from "@/lib/utils";
import { getBrowserSupabase } from "@/lib/supabase";
import { MochiFace } from "@/components/MochiLogo";

const NAME_KEY = "mochi-comment-name";
const PAGE = 20;

function Avatar({ name, admin = false }: { name: string; admin?: boolean }) {
  // Admin: dùng logo viên mochi của tiệm thay cho chữ cái đầu
  if (admin) {
    return (
      <span
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white ring-1 ring-sakura-deep/30"
      >
        <MochiFace className="h-7 w-7" />
      </span>
    );
  }
  const h = hueFrom(name);
  return (
    <span
      aria-hidden
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-base font-black text-white"
      style={{ background: `hsl(${h} 65% 68%)` }}
    >
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}

/** Cảm nhận sau khi ăn bánh: ai cũng đọc và gửi được; admin ẩn/xoá/phản hồi ở trang quản trị. */
export function CommentSection({ releaseId }: { releaseId: string }) {
  const [items, setItems] = useState<PublicComment[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(
    async (lim: number) => {
      try {
        const res = await fetch(`/api/comments?release=${releaseId}&limit=${lim}`, { cache: "no-store" });
        const json = await res.json();
        setItems(json.items ?? []);
        setHasMore(Boolean(json.hasMore));
        setDisabled(Boolean(json.disabled));
      } catch {
        /* giữ nguyên danh sách hiện có */
      }
      setLoading(false);
    },
    [releaseId],
  );

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {}
    // Đã đăng nhập → dùng tên tài khoản làm tên bình luận
    const sb = getBrowserSupabase();
    sb?.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      if (!u) return;
      const { data: p } = await sb.from("profiles").select("username").eq("id", u.id).maybeSingle();
      const n = p?.username || (u.user_metadata?.username as string | undefined);
      if (n) setName(n);
    });
  }, []);

  useEffect(() => {
    load(limit);
  }, [load, limit]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ release_id: releaseId, name, content, website }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: json.error ?? "Không gửi được bình luận" });
      } else {
        try {
          localStorage.setItem(NAME_KEY, name.trim());
        } catch {}
        setContent("");
        setMsg({ ok: true, text: "Cảm ơn bạn đã chia sẻ cảm nhận 🍡" });
        await load(limit);
      }
    } catch {
      setMsg({ ok: false, text: "Mất kết nối, thử lại sau nhé" });
    }
    setBusy(false);
  };

  if (disabled) return null;

  const field =
    "w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink ring-1 ring-line outline-none transition placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-sakura";

  return (
    <section aria-labelledby="comments-title" className="mt-10 text-left">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-8 w-2.5 rounded-full bg-gradient-to-b from-sakura to-sakura-deep" aria-hidden />
        <h2 id="comments-title" className="font-display text-xl font-black md:text-2xl">
          Cảm nhận sau khi ăn bánh
        </h2>
        {!loading && items.length > 0 && (
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-extrabold ring-1 ring-line">
            {items.length}
            {hasMore ? "+" : ""}
          </span>
        )}
      </div>

      <form onSubmit={submit} className="shadow-mochi rounded-[2rem] bg-surface p-4 ring-1 ring-line sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[14rem_1fr]">
          <input
            className={field}
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên của bạn (không bắt buộc)"
            autoComplete="nickname"
            aria-label="Tên của bạn"
          />
          <div className="sm:col-start-1 sm:col-span-2">
            <textarea
              className={`${field} min-h-24 resize-y`}
              value={content}
              maxLength={COMMENT_MAX}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bánh ăn có ngon không? Chia sẻ cảm nhận của bạn nhé…"
              required
              aria-label="Cảm nhận của bạn"
            />
          </div>
        </div>
        {/* Ô bẫy bot: ẩn với người dùng */}
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          aria-hidden
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          name="website"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy || content.trim().length < 2}
            className="press inline-flex h-11 items-center gap-2 rounded-full bg-sakura-deep px-6 text-sm font-extrabold text-white shadow-[0_8px_20px_-10px] shadow-sakura-deep hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? "Đang gửi…" : "Gửi cảm nhận"}
          </button>
          <span className="text-xs text-muted">{content.length}/{COMMENT_MAX}</span>
          {msg && (
            <span
              role="status"
              className={`text-sm font-bold ${msg.ok ? "text-matcha-deep" : "text-red-600 dark:text-red-300"}`}
            >
              {msg.text}
            </span>
          )}
        </div>
      </form>

      <div className="mt-5 space-y-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-3xl" />)
        ) : items.length === 0 ? (
          <p className="rounded-3xl bg-surface px-5 py-8 text-center text-sm text-muted ring-1 ring-line">
            Chưa có ai chia sẻ cảm nhận. Hãy là người đầu tiên nhé!
          </p>
        ) : (
          items.map((c) => (
            <article key={c.id} className="rounded-3xl bg-surface p-4 ring-1 ring-line sm:p-5">
              <div className="flex gap-3">
                <Avatar name={c.author_name} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-extrabold">{c.author_name}</span>
                    <time dateTime={c.created_at} className="text-xs text-muted">
                      {timeAgo(c.created_at)}
                    </time>
                  </div>
                  <p className="mt-1 whitespace-pre-line break-words leading-relaxed text-ink/90">{c.content}</p>
                </div>
              </div>

              {c.reply && (
                <div className="mt-3 flex gap-3 rounded-2xl bg-matcha/10 p-3 ring-1 ring-matcha/30 sm:ml-12">
                  <Avatar name="Tiệm bánh Mochi" admin />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="font-extrabold">Tiệm bánh Mochi</span>
                      <span className="rounded-full bg-matcha/25 px-2 py-0.5 text-[0.65rem] font-extrabold text-matcha-deep">
                        Admin
                      </span>
                      {c.replied_at && <span className="text-xs text-muted">{timeAgo(c.replied_at)}</span>}
                    </div>
                    <p className="mt-1 whitespace-pre-line break-words leading-relaxed text-ink/90">{c.reply}</p>
                  </div>
                </div>
              )}
            </article>
          ))
        )}

        {hasMore && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setLimit((l) => l + PAGE)}
              className="press inline-flex h-11 items-center rounded-full bg-surface px-6 text-sm font-extrabold ring-1 ring-line hover:bg-surface-2"
            >
              Xem thêm cảm nhận
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
