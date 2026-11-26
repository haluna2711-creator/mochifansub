"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconGrid, IconHome, IconMagnet, IconSearch } from "./Icons";

const items = [
  { href: "/", label: "Trang chủ", icon: IconHome, match: (p: string) => p === "/" },
  { href: "/browse", label: "Khám phá", icon: IconGrid, match: (p: string) => p === "/browse" },
  { href: "/#latest", label: "Torrent mới", icon: IconMagnet, match: () => false },
  { href: "/browse?focus=1", label: "Tìm kiếm", icon: IconSearch, match: () => false },
];

/** Thanh điều hướng dạng "viên mochi" nổi ở đáy màn hình mobile; tự ẩn khi cuộn xuống. */
export function MobileNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last.current;
        if (Math.abs(delta) > 6) {
          setHidden(delta > 0 && y > 120);
          last.current = y;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Điều hướng"
      className={`pb-safe fixed inset-x-0 bottom-0 z-40 px-4 pb-3 transition-transform duration-500 [transition-timing-function:var(--ease-mochi)] md:hidden ${
        hidden ? "translate-y-[130%]" : "translate-y-0"
      }`}
    >
      <ul className="shadow-mochi mx-auto mb-1 flex max-w-sm items-center justify-around rounded-full bg-surface/90 p-1.5 ring-1 ring-line backdrop-blur-xl">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`press flex flex-col items-center gap-0.5 rounded-full py-2 text-[0.65rem] font-bold ${
                  active ? "bg-sakura/35 text-sakura-deep" : "text-muted"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
