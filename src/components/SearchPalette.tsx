"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReleaseStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/utils";
import { Cover } from "./Cover";
import { IconArrow, IconSearch, IconX } from "./Icons";
import { MochiFace } from "./MochiLogo";

type Item = {
  id: string;
  slug: string;
  title: string;
  title_jp: string | null;
  cover_url: string | null;
  status: ReleaseStatus;
  total_episodes: number | null;
  year: number | null;
};

const RECENT_KEY = "mochi-recent-search";
const statusDot = { ongoing: "bg-matcha", completed: "bg-sakura-deep", upcoming: "bg-yuzu" } as const;

/** Mở bảng tìm kiếm từ bất kỳ đâu */
export function openSearch() {
  window.dispatchEvent(new Event("mochi:open-search"));
}

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 5);
  } catch {
    return [];
  }
}

export function SearchPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Mở bằng sự kiện, phím "/" hoặc Ctrl/⌘ + K
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("mochi:open-search", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mochi:open-search", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Đóng khi chuyển trang
  useEffect(() => close(), [pathname, close]);

  // Khoá cuộn trang nền + focus ô nhập
  useEffect(() => {
    if (!open) return;
    setRecent(readRecent());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => input.current?.focus(), 40);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open]);

  // Tìm kiếm có debounce
  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        const data = await res.json();
        setItems(data.items ?? []);
        setActive(0);
      } catch {}
      setLoading(false);
    }, q ? 220 : 0);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, open]);

  const remember = (term: string) => {
    if (!term.trim()) return;
    try {
      const next = [term.trim(), ...readRecent().filter((x) => x !== term.trim())].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  const go = (href: string) => {
    remember(q);
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (q.trim() && items[active]) go(`/anime/${items[active].slug}`);
      else if (q.trim()) go(`/browse?q=${encodeURIComponent(q.trim())}`);
      else if (items[active]) go(`/anime/${items[active].slug}`);
    }
  };

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Tìm bánh">
      <button
        type="button"
        aria-label="Đóng"
        onClick={close}
        className="absolute inset-0 bg-[#3b2a2e]/35 backdrop-blur-md"
        style={{ animation: "fade-in .2s ease both" }}
      />

      <div
        className="relative flex h-full flex-col bg-bg md:mx-auto md:mt-[10vh] md:h-auto md:max-h-[75vh] md:max-w-xl md:overflow-hidden md:rounded-[2rem] md:shadow-2xl md:ring-1 md:ring-line"
        style={{ animation: "pop-in .4s var(--ease-mochi) both" }}
      >
        {/* Ô nhập */}
        <div className="flex items-center gap-2 border-b border-line p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:p-4">
          <label className="flex h-13 flex-1 items-center gap-3 rounded-full bg-surface px-4 ring-2 ring-sakura/60 transition focus-within:ring-sakura md:h-12 md:bg-transparent md:px-2 md:ring-0 md:focus-within:ring-0">
            {loading ? (
              <MochiFace className="animate-wobble h-6 w-6 shrink-0" />
            ) : (
              <IconSearch className="h-5 w-5 shrink-0 text-sakura-deep" />
            )}
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Tìm bánh, tên tiếng Nhật…"
              aria-label="Tìm bánh"
              className="search-input h-full w-full bg-transparent text-base font-semibold text-ink placeholder:font-normal placeholder:text-muted md:text-lg"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  input.current?.focus();
                }}
                aria-label="Xoá"
                className="press grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-muted hover:text-ink"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={close}
            className="press shrink-0 rounded-full px-3 py-2 text-sm font-bold text-muted hover:text-ink md:hidden"
          >
            Huỷ
          </button>
          <kbd className="hidden shrink-0 rounded-lg bg-surface-2 px-2 py-1 text-[0.7rem] font-bold text-muted ring-1 ring-line md:block">
            Esc
          </kbd>
        </div>

        {/* Nội dung */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 md:p-4">
          {!q && recent.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 px-2 text-xs font-extrabold uppercase tracking-wide text-muted">Tìm gần đây</p>
              <div className="flex flex-wrap gap-2 px-1">
                {recent.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setQ(r)}
                    className="press rounded-full bg-surface px-3.5 py-1.5 text-sm font-bold ring-1 ring-line hover:bg-sakura/20 hover:text-sakura-deep"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mb-2 px-2 text-xs font-extrabold uppercase tracking-wide text-muted">
            {q ? `Kết quả cho “${q}”` : "Bánh mới hấp"}
          </p>

          {items.length === 0 && !loading ? (
            <div className="flex flex-col items-center py-10 text-center">
              <MochiFace className="animate-wobble h-14 w-14" mood="sad" />
              <p className="mt-3 font-display font-extrabold">Không tìm thấy phim nào</p>
              <p className="text-sm text-muted">Thử gõ tên khác, hoặc bỏ dấu xem sao.</p>
            </div>
          ) : (
            <ul ref={listRef} className="space-y-1">
              {items.map((it, i) => (
                <li key={it.id}>
                  <Link
                    href={`/anime/${it.slug}`}
                    data-i={i}
                    onClick={() => remember(q)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 rounded-2xl p-2 transition-colors ${
                      i === active ? "bg-sakura/20" : "hover:bg-surface"
                    }`}
                  >
                    <span className="relative aspect-[2/3] w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-line">
                      <Cover src={it.cover_url} title={it.title} sizes="44px" showTitle={false} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate font-display font-bold ${i === active ? "text-sakura-deep" : ""}`}>
                        {it.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot[it.status]}`} />
                        {STATUS_LABEL[it.status]}
                        {it.total_episodes ? ` · ${it.total_episodes} tập` : ""}
                        {it.year ? ` · ${it.year}` : ""}
                      </span>
                    </span>
                    <IconArrow
                      className={`h-4 w-4 shrink-0 transition ${i === active ? "text-sakura-deep opacity-100" : "opacity-0"}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chân bảng */}
        <div className="flex items-center gap-3 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-4">
          <button
            type="button"
            onClick={() => go(q.trim() ? `/browse?q=${encodeURIComponent(q.trim())}` : "/browse")}
            className="press flex-1 rounded-full bg-sakura-deep py-2.5 text-sm font-extrabold text-white md:flex-none md:px-5"
          >
            {q.trim() ? "Xem tất cả kết quả" : "Tham quan tiệm bánh"}
          </button>
          <span className="ml-auto hidden items-center gap-3 text-xs text-muted md:flex">
            <span><kbd className="rounded bg-surface-2 px-1.5 py-0.5 font-bold ring-1 ring-line">↑↓</kbd> chọn</span>
            <span><kbd className="rounded bg-surface-2 px-1.5 py-0.5 font-bold ring-1 ring-line">Enter</kbd> mở</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Nút mở bảng tìm kiếm trên header */
export function SearchTrigger() {
  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className="press group ml-auto hidden h-11 w-72 items-center gap-3 rounded-full bg-surface pl-4 pr-2 text-left ring-1 ring-line hover:ring-sakura md:flex lg:w-80"
      >
        <IconSearch className="h-4 w-4 text-muted transition-colors group-hover:text-sakura-deep" />
        <span className="flex-1 text-sm text-muted">Tìm bánh…</span>
      </button>
      <button
        type="button"
        onClick={openSearch}
        aria-label="Tìm kiếm"
        className="press ml-auto grid h-10 w-10 place-items-center rounded-full bg-surface text-ink ring-1 ring-line md:hidden"
      >
        <IconSearch />
      </button>
    </>
  );
}
