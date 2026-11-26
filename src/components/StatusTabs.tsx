"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Tab = { key?: string; label: string; href: string };

/** Thanh lọc trạng thái: đổi màu ngay khi bấm, không đợi server trả dữ liệu. */
export function StatusTabs({ tabs, active }: { tabs: Tab[]; active?: string }) {
  // Tab vừa bấm (hiển thị tức thì); undefined = chưa bấm gì
  const [clicked, setClicked] = useState<{ key?: string } | null>(null);

  // Khi URL thật đã cập nhật → bỏ trạng thái tạm
  useEffect(() => setClicked(null), [active]);

  const current = clicked ? clicked.key : active;
  const waiting = clicked !== null && clicked.key !== active;

  return (
    <div className="inline-flex shrink-0 gap-1 rounded-full bg-surface p-1 ring-1 ring-line">
      {tabs.map((t) => {
        const isActive = t.key === current;
        return (
          <Link
            key={t.label}
            href={t.href}
            scroll={false}
            onClick={() => setClicked({ key: t.key })}
            aria-current={isActive ? "page" : undefined}
            className={`press whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
              isActive ? "bg-sakura-deep text-white shadow" : "text-muted hover:text-ink"
            } ${waiting && isActive ? "animate-pulse" : ""}`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
