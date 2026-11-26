"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MochiLogo } from "./MochiLogo";
import { ThemeToggle } from "./ThemeToggle";
import { SearchTrigger } from "./SearchPalette";

const links = [
  { href: "/", label: "Cửa tiệm" },
  { href: "/browse", label: "Tủ bánh" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
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
        <Link href="/" className="group shrink-0" aria-label="Tiệm bánh Mochi - Trang chủ">
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

        <SearchTrigger />

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
