"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "./Icons";

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("mochi-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };
  return { dark, toggle };
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { dark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      className={`press grid h-10 w-10 place-items-center rounded-full bg-surface text-ink ring-1 ring-line hover:bg-surface-2 ${className}`}
    >
      {dark ? <IconSun /> : <IconMoon />}
    </button>
  );
}

/** Script chạy trước khi render để tránh nháy màu. */
export const themeScript = `(function(){try{var t=localStorage.getItem('mochi-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;
