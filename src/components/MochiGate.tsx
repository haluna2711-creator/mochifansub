"use client";

import { useEffect, useRef, useState } from "react";
import { MochiFace } from "./MochiLogo";

type Phase = "idle" | "wrapping" | "ready";

/**
 * Cổng "mua bánh": ẩn khu vực tải xuống sau một cục mochi.
 * Rê chuột → "Ấn vào tui để mua bánh" · bấm → "Đang gói bánh…" đếm 30 giây
 * · xong → "Cầm bánh về" và hiện phần tải xuống (children).
 */
export function MochiGate({ children, seconds = 30 }: { children: React.ReactNode; seconds?: number }) {
  const total = seconds * 1000;
  const [phase, setPhase] = useState<Phase>("idle");
  const [left, setLeft] = useState(total);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const start = () => {
    if (phase !== "idle") return;
    const end = Date.now() + total; // tính theo giờ thật → đúng cả khi tab chạy nền bị chậm
    setLeft(total);
    setPhase("wrapping");
    timer.current = setInterval(() => {
      const remain = end - Date.now();
      if (remain <= 0) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setLeft(0);
        setPhase("ready");
      } else {
        setLeft(remain);
      }
    }, 200);
  };

  const styles = (
    <style>{`
      .mg-hint {
        position: relative;
        opacity: 0;
        transform: translateY(6px) scale(0.95);
        transition: opacity .25s ease, transform .35s var(--ease-mochi, ease);
      }
      .mg-hint::before {
        content: "";
        position: absolute;
        top: -5px;
        left: 50%;
        width: 10px;
        height: 10px;
        background: inherit;
        border-radius: 2px;
        transform: translateX(-50%) rotate(45deg);
      }
      .mg:hover .mg-hint, .mg:focus-visible .mg-hint { opacity: 1; transform: none; }
      @media (hover: none) { .mg-hint { opacity: 1; transform: none; } }
      .mg-jump { transform-origin: 50% 100%; animation: mg-jump .9s ease-in-out infinite; }
      .mg-spark { animation: mg-spark 1.6s ease-in-out infinite; }
      @keyframes mg-jump {
        0%, 100% { transform: translateY(0) scale(1.06, 0.92); }
        40% { transform: translateY(-14px) scale(0.96, 1.06); }
        70% { transform: translateY(0) scale(1.06, 0.92); }
      }
      @keyframes mg-spark {
        0%, 100% { opacity: .25; transform: scale(.6) rotate(0deg); }
        50% { opacity: 1; transform: scale(1) rotate(20deg); }
      }
    `}</style>
  );

  if (phase === "ready") {
    return (
      <div className="animate-rise">
        <div className="mb-3 flex items-center gap-2">
          <MochiFace className="animate-wobble h-9 w-9" />
          <p className="font-display text-lg font-black text-sakura-deep">Cầm bánh về</p>
        </div>
        {children}
      </div>
    );
  }

  if (phase === "wrapping") {
    const progress = Math.min(1, Math.max(0, 1 - left / total));
    const secs = Math.ceil(left / 1000);
    return (
      <div className="shadow-mochi relative flex flex-col items-center overflow-hidden rounded-[2rem] bg-surface px-6 py-9 text-center ring-1 ring-line">
        {styles}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sakura/25 blur-3xl"
        />
        <div className="relative">
          <MochiFace className="mg-jump h-24 w-24 drop-shadow-md" />
          <span aria-hidden className="mg-spark absolute -left-4 top-1 text-lg">✨</span>
          <span aria-hidden className="mg-spark absolute -right-4 top-6 text-base" style={{ animationDelay: ".7s" }}>✨</span>
        </div>
        <p role="status" className="relative mt-4 font-display text-lg font-black">Đang gói bánh…</p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="relative mt-3 h-3 w-full max-w-xs overflow-hidden rounded-full bg-sakura/20"
        >
          <div
            className="h-full origin-left rounded-full bg-gradient-to-r from-sakura to-sakura-deep transition-transform duration-200 ease-linear"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <p aria-hidden className="relative mt-2 text-sm font-bold text-muted">còn {secs}s</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      aria-label="Ấn vào để mua bánh"
      className="mg group shadow-mochi relative flex w-full cursor-pointer flex-col items-center overflow-hidden rounded-[2rem] bg-surface px-4 py-10 ring-1 ring-line transition-colors hover:bg-sakura/10"
    >
      {styles}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sakura/25 blur-3xl"
      />
      <MochiFace className="animate-wobble relative h-28 w-28 drop-shadow-md transition-transform duration-300 group-hover:scale-110 group-active:scale-95" />
      <span className="mg-hint pointer-events-none mt-5 rounded-full bg-sakura-deep px-4 py-1.5 text-sm font-extrabold text-white shadow-lg">
        Ấn vào tui để mua bánh
      </span>
    </button>
  );
}
