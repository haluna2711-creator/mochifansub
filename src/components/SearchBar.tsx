"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { IconSearch, IconX } from "./Icons";

/** Ô tìm kiếm có debounce — kết quả cập nhật khi đang gõ. */
export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (params.get("focus")) input.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      next.delete("focus");
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      start(() => router.replace(`/browse${next.size ? `?${next}` : ""}`, { scroll: false }));
    }, 320);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <label className="shadow-mochi flex h-14 items-center gap-3 rounded-full bg-surface px-5 ring-1 ring-line transition focus-within:ring-2 focus-within:ring-sakura">
      <IconSearch className={`h-5 w-5 shrink-0 ${pending ? "animate-pulse text-sakura-deep" : "text-muted"}`} />
      <input
        ref={input}
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tìm theo tên phim, tên tiếng Nhật…"
        aria-label="Tìm phim"
        className="h-full w-full bg-transparent text-base text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Xoá"
          className="press grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-muted"
        >
          <IconX className="h-4 w-4" />
        </button>
      )}
    </label>
  );
}
