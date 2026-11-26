"use client";

import { useEffect, useState } from "react";
import { IconHeart } from "./Icons";

const KEY = "mochi-favorites";

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Nút ♥ Yêu thích dưới poster. Lưu trong trình duyệt của người xem (không cần đăng nhập). */
export function FavoriteButton({ releaseId }: { releaseId: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(read().includes(releaseId));
  }, [releaseId]);

  const toggle = () => {
    const list = read();
    const next = list.includes(releaseId) ? list.filter((x) => x !== releaseId) : [...list, releaseId];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    setOn(next.includes(releaseId));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className="fav-btn press mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-surface px-5 text-sm font-extrabold text-ink ring-1 ring-line hover:ring-sakura"
    >
      <IconHeart className="fav-heart h-5 w-5 text-sakura-deep" filled={on} />
      Yêu thích
    </button>
  );
}
