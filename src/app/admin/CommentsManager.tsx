"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { IconX } from "@/components/Icons";
import { normalize, timeAgo } from "@/lib/utils";
import { COMMENT_MAX } from "@/lib/comments";
import { Button, Spinner, inputCls } from "./ui";

export interface AdminComment {
  id: string;
  release_id: string;
  author_name: string;
  content: string;
  hidden: boolean;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
  release: { slug: string; title: string } | { slug: string; title: string }[] | null;
}

const PAGE = 50;
type Tab = "all" | "pending" | "hidden";

const relOf = (c: AdminComment) => (Array.isArray(c.release) ? c.release[0] : c.release) ?? null;

/** Số bình luận hiển thị công khai nhưng chưa được phản hồi (hiện trên nút ở header). */
export async function countPending(sb: SupabaseClient): Promise<number> {
  const { count } = await sb
    .from("comments")
    .select("id", { count: "exact", head: true })
    .is("reply", null)
    .eq("hidden", false);
  return count ?? 0;
}

export function CommentsManager({ sb, onClose, onChanged }: { sb: SupabaseClient; onClose: () => void; onChanged: () => void }) {
  const [items, setItems] = useState<AdminComment[]>([]);
  const [limit, setLimit] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const load = useCallback(async () => {
    const { data, error } = await sb
      .from("comments")
      .select("*, release:releases(slug,title)")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      setError(
        error.message.includes("comments")
          ? "Chưa có bảng bình luận. Hãy chạy file supabase/add-comments.sql trong Supabase → SQL Editor."
          : error.message,
      );
    } else {
      setError("");
      setItems((data ?? []) as AdminComment[]);
    }
    setLoading(false);
  }, [sb, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (id: string, change: Partial<AdminComment>) =>
    setItems((list) => list.map((c) => (c.id === id ? { ...c, ...change } : c)));

  const counts = useMemo(
    () => ({
      all: items.length,
      pending: items.filter((c) => !c.hidden && !c.reply).length,
      hidden: items.filter((c) => c.hidden).length,
    }),
    [items],
  );

  const shown = useMemo(() => {
    const nq = normalize(q);
    return items.filter((c) => {
      if (tab === "pending" && (c.hidden || c.reply)) return false;
      if (tab === "hidden" && !c.hidden) return false;
      if (!nq) return true;
      return normalize(`${c.author_name} ${c.content} ${c.reply ?? ""} ${relOf(c)?.title ?? ""}`).includes(nq);
    });
  }, [items, tab, q]);

  const tabs: [Tab, string][] = [
    ["all", "Tất cả"],
    ["pending", "Chưa phản hồi"],
    ["hidden", "Đã ẩn"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button type="button" aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative flex h-full w-full max-w-2xl flex-col bg-bg shadow-2xl md:rounded-l-[2rem]"
        style={{ animation: "rise .45s var(--ease-mochi) both" }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-black">Cảm nhận của khách</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="press ml-auto grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-line">
            <IconX />
          </button>
        </div>

        <div className="space-y-3 border-b border-line px-5 py-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {tabs.map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`press shrink-0 rounded-full px-4 py-2 text-sm font-bold ring-1 ${
                  tab === k ? "bg-sakura-deep text-white ring-sakura-deep" : "bg-surface text-ink ring-line hover:bg-surface-2"
                }`}
              >
                {label} <span className="opacity-70">{counts[k]}</span>
              </button>
            ))}
          </div>
          <input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên, nội dung, phim…" />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {loading ? (
            <div className="grid place-items-center py-24 text-sakura-deep">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">{error}</p>
          ) : shown.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">Không có bình luận nào.</p>
          ) : (
            <ul className="space-y-4">
              {shown.map((c) => (
                <CommentRow key={c.id} sb={sb} c={c} onPatch={patch} onRemoved={() => { setItems((l) => l.filter((x) => x.id !== c.id)); onChanged(); }} onChanged={onChanged} />
              ))}
            </ul>
          )}

          {!loading && !error && items.length >= limit && (
            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={() => setLimit((l) => l + PAGE)}>
                Tải thêm
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentRow({
  sb,
  c,
  onPatch,
  onRemoved,
  onChanged,
}: {
  sb: SupabaseClient;
  c: AdminComment;
  onPatch: (id: string, change: Partial<AdminComment>) => void;
  onRemoved: () => void;
  onChanged: () => void;
}) {
  const [text, setText] = useState(c.reply ?? "");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const rel = relOf(c);

  const run = async (fn: () => PromiseLike<{ error: { message: string } | null }>, after: () => void) => {
    setBusy(true);
    setErr("");
    const { error } = await fn();
    setBusy(false);
    if (error) return setErr(error.message);
    after();
    onChanged();
  };

  const saveReply = () => {
    const reply = text.trim();
    if (!reply) return;
    const replied_at = new Date().toISOString();
    run(
      () => sb.from("comments").update({ reply, replied_at }).eq("id", c.id),
      () => {
        onPatch(c.id, { reply, replied_at });
        setEditing(false);
      },
    );
  };

  const removeReply = () =>
    run(
      () => sb.from("comments").update({ reply: null, replied_at: null }).eq("id", c.id),
      () => {
        onPatch(c.id, { reply: null, replied_at: null });
        setText("");
        setEditing(false);
      },
    );

  const toggleHidden = () =>
    run(
      () => sb.from("comments").update({ hidden: !c.hidden }).eq("id", c.id),
      () => onPatch(c.id, { hidden: !c.hidden }),
    );

  const remove = () => {
    if (!confirm("Xoá hẳn bình luận này? Không thể khôi phục.")) return;
    run(
      () => sb.from("comments").delete().eq("id", c.id),
      onRemoved,
    );
  };

  return (
    <li className={`rounded-3xl bg-surface p-4 ring-1 ring-line ${c.hidden ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-extrabold">{c.author_name}</span>
        <span className="text-xs text-muted">{timeAgo(c.created_at)}</span>
        {c.hidden && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[0.65rem] font-extrabold text-red-600 dark:text-red-300">Đã ẩn</span>}
        {!c.hidden && !c.reply && <span className="rounded-full bg-yuzu/30 px-2 py-0.5 text-[0.65rem] font-extrabold">Chưa phản hồi</span>}
      </div>
      {rel && (
        <a href={`/${rel.slug}`} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-xs font-bold text-sakura-deep hover:underline">
          {rel.title}
        </a>
      )}
      <p className="mt-2 whitespace-pre-line break-words leading-relaxed">{c.content}</p>

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            className={`${inputCls} min-h-20 resize-y`}
            value={text}
            maxLength={COMMENT_MAX}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            placeholder="Viết phản hồi (hiện ngay dưới bình luận trên trang phim)…"
          />
          <div className="flex flex-wrap gap-2">
            <Button className="h-10 px-4" onClick={saveReply} disabled={busy || !text.trim()}>
              {busy && <Spinner />} {c.reply ? "Lưu phản hồi" : "Gửi phản hồi"}
            </Button>
            <Button variant="ghost" className="h-10 px-4" onClick={() => { setEditing(false); setText(c.reply ?? ""); }}>
              Huỷ
            </Button>
          </div>
        </div>
      ) : (
        <>
          {c.reply && (
            <div className="mt-3 rounded-2xl bg-matcha/10 p-3 ring-1 ring-matcha/30">
              <p className="text-xs font-extrabold text-matcha-deep">
                Phản hồi của bạn{c.replied_at ? ` · ${timeAgo(c.replied_at)}` : ""}
              </p>
              <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed">{c.reply}</p>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="matcha" className="h-10 px-4" onClick={() => setEditing(true)} disabled={busy}>
              {c.reply ? "Sửa phản hồi" : "Phản hồi"}
            </Button>
            {c.reply && (
              <Button variant="ghost" className="h-10 px-4" onClick={removeReply} disabled={busy}>
                Gỡ phản hồi
              </Button>
            )}
            <Button variant="ghost" className="h-10 px-4" onClick={toggleHidden} disabled={busy}>
              {c.hidden ? "Hiện lại" : "Ẩn"}
            </Button>
            <Button variant="danger" className="h-10 px-4" onClick={remove} disabled={busy}>
              Xoá
            </Button>
          </div>
        </>
      )}
      {err && <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-300">{err}</p>}
    </li>
  );
}
