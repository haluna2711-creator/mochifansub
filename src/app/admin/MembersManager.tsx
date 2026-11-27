"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { IconX } from "@/components/Icons";
import { timeAgo } from "@/lib/utils";
import { Button, Spinner, inputCls } from "./ui";

interface Member {
  id: string;
  username: string | null;
  email: string | null;
  created_at: string;
  banned: boolean;
}

const PAGE = 50;

export function MembersManager({ sb, onClose }: { sb: SupabaseClient; onClose: () => void }) {
  const [items, setItems] = useState<Member[]>([]);
  const [limit, setLimit] = useState(PAGE);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

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

  // Đợi người dùng ngừng gõ rồi mới tìm
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(q.trim());
      setLimit(PAGE);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    const { data, error } = await sb.rpc("admin_list_members", { p_q: query, p_limit: limit });
    if (error) {
      setError(
        /admin_list_members|schema cache|function/i.test(error.message)
          ? "Chưa có hàm quản lý thành viên. Hãy chạy file supabase/add-member-ban.sql trong Supabase → SQL Editor."
          : error.message,
      );
    } else {
      setError("");
      setItems((data ?? []) as Member[]);
    }
    setLoading(false);
  }, [sb, query, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const setBan = async (m: Member, banned: boolean) => {
    const name = m.username || m.email || "thành viên này";
    const ok = window.confirm(
      banned
        ? `Khóa ${name}?\nHọ sẽ bị đăng xuất và không đăng nhập lại được cho tới khi bạn mở khóa.`
        : `Mở khóa ${name}?`,
    );
    if (!ok) return;
    setBusyId(m.id);
    setNotice(null);
    const { error } = await sb.rpc("admin_set_ban", { p_user: m.id, p_banned: banned });
    setBusyId(null);
    if (error) {
      return setNotice({
        ok: false,
        text: /cannot_ban_admin/.test(error.message) ? "Không thể khóa tài khoản admin." : error.message,
      });
    }
    setItems((list) => list.map((x) => (x.id === m.id ? { ...x, banned } : x)));
    setNotice({ ok: true, text: banned ? `Đã khóa ${name}.` : `Đã mở khóa ${name}.` });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button type="button" aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative flex h-full w-full max-w-2xl flex-col bg-bg shadow-2xl md:rounded-l-[2rem]"
        style={{ animation: "rise .45s var(--ease-mochi) both" }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-black">Thành viên</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="press ml-auto grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-line">
            <IconX />
          </button>
        </div>

        <div className="space-y-3 border-b border-line px-5 py-3">
          <input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên hoặc email…" />
          {notice && (
            <p className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${notice.ok ? "bg-matcha/20 text-matcha-deep" : "bg-red-500/10 text-red-600 dark:text-red-300"}`}>
              {notice.text}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {loading ? (
            <div className="grid place-items-center py-24 text-sakura-deep">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">{error}</p>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">Không có thành viên nào.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {items.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-extrabold">
                        <span className="truncate">{m.username || "(chưa đặt tên)"}</span>
                        {m.banned && (
                          <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-[0.7rem] font-extrabold text-red-600 dark:text-red-300">
                            Đã khóa
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {m.email} · tham gia {timeAgo(m.created_at)}
                      </p>
                    </div>
                    <Button
                      variant={m.banned ? "ghost" : "danger"}
                      className="h-10 shrink-0 px-4"
                      disabled={busyId === m.id}
                      onClick={() => setBan(m, !m.banned)}
                    >
                      {busyId === m.id && <Spinner />} {m.banned ? "Mở khóa" : "Khóa"}
                    </Button>
                  </li>
                ))}
              </ul>
              {items.length >= limit && (
                <div className="mt-5 text-center">
                  <Button variant="ghost" onClick={() => setLimit((n) => n + PAGE)}>
                    Xem thêm
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
