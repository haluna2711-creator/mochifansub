"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MochiLogo } from "./MochiLogo";
import { ThemeToggle } from "./ThemeToggle";
import { IconSearch } from "./Icons";

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/browse", label: "Khám phá" },
  { href: "/browse?status=ongoing", label: "Đang chiếu" },
  { href: "/browse?status=completed", label: "Trọn bộ" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-bg/80 shadow-[0_8px_30px_-18px_rgb(var(--shadow)/.45)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 md:h-[4.5rem]">
        <Link href="/" className="group shrink-0" aria-label="Mochi Fansub - Trang chủ">
          <MochiLogo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname === l.href.split("?")[0] && l.href === "/browse";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`press rounded-full px-4 py-2 text-sm font-bold ${
                  active ? "bg-sakura/30 text-sakura-deep" : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <form
          role="search"
          className="ml-auto hidden md:block"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(q.trim() ? `/browse?q=${encodeURIComponent(q.trim())}` : "/browse");
          }}
        >
          <label className="group flex h-11 w-64 items-center gap-2 rounded-full bg-surface px-4 ring-1 ring-line transition-all focus-within:w-80 focus-within:ring-2 focus-within:ring-sakura">
            <IconSearch className="h-4.5 w-4.5 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm phim…"
              aria-label="Tìm phim"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/browse?focus=1"
            aria-label="Tìm kiếm"
            className="press grid h-10 w-10 place-items-center rounded-full bg-surface text-ink ring-1 ring-line md:hidden"
          >
            <IconSearch />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
