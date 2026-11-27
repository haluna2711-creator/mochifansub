"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SHOW_AFTER = 480; // px cuộn xuống rồi mới hiện nút

/**
 * Nút "Lên đầu tiệm" hình mochi, nổi ở mép phải màn hình.
 * • Hiện khi đã cuộn xuống, ẩn khi ở đầu trang.
 * • Mobile: nằm phía trên thanh điều hướng, tự hạ xuống khi thanh đó ẩn (cùng nhịp cuộn với MobileNav).
 * • Desktop: góc phải dưới. Rê chuột/focus → mochi cười tít mắt; bấm → mochi nhảy lên và trang cuộn mượt về đầu.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [jumping, setJumping] = useState(false);
  const last = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      setVisible(y > SHOW_AFTER);
      // Cùng công thức với MobileNav để hai bên luôn đồng bộ
      const delta = y - last.current;
      if (Math.abs(delta) > 6) {
        setNavHidden(delta > 0 && y > 120);
        last.current = y;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    setVisible(window.scrollY > SHOW_AFTER);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const goTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    setJumping(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJumping(false), 900);
  };

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Lên đầu trang"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`stt group fixed right-[max(0.75rem,env(safe-area-inset-right,0px))] z-40 w-[3.25rem] select-none rounded-full outline-none transition-all duration-500 [transition-timing-function:var(--ease-mochi)] focus-visible:ring-2 focus-visible:ring-sakura-deep focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:w-14 md:bottom-8 md:right-8 md:w-[3.75rem] ${
        navHidden ? "bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)]" : "bottom-[calc(env(safe-area-inset-bottom,0px)+5.75rem)]"
      } ${visible ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-6 scale-50 opacity-0"}`}
    >
      <style>{`
        .stt-float { animation: stt-float 3.2s ease-in-out infinite; }
        .stt-arrow { animation: stt-bob 1.6s ease-in-out infinite; }
        .stt-body { transform-box: fill-box; transform-origin: 50% 100%; transition: transform .35s var(--ease-mochi, ease); }
        .stt:hover .stt-body, .stt:focus-visible .stt-body { transform: scale(1.07, 1.1); }
        .stt:active .stt-body { transform: scale(1.12, .9); }
        .stt-jump { transform-box: fill-box; transform-origin: 50% 100%; animation: stt-jump .9s ease-in-out both; }
        .stt-eyes { transform-box: fill-box; transform-origin: 50% 50%; animation: stt-blink 4.5s ease-in-out infinite; }
        .stt-happy { opacity: 0; }
        .stt:hover .stt-eyes, .stt:focus-visible .stt-eyes, .stt-jump .stt-eyes { opacity: 0; }
        .stt:hover .stt-happy, .stt:focus-visible .stt-happy { opacity: 1; }
        @keyframes stt-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes stt-bob { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(-3px); opacity: .75; } }
        @keyframes stt-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
        @keyframes stt-jump {
          0%   { transform: scale(1, 1); }
          22%  { transform: scale(1.14, .84); }
          58%  { transform: translateY(-22px) scale(.9, 1.14); }
          100% { transform: translateY(0) scale(1, 1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .stt-float, .stt-arrow, .stt-eyes, .stt-jump { animation: none; }
        }
      `}</style>

      <svg
        viewBox="0 0 64 78"
        className="stt-float block h-auto w-full overflow-visible text-sakura-deep drop-shadow-[0_6px_12px_rgba(190,80,115,.35)]"
        aria-hidden
      >
        <defs>
          <radialGradient id="stt-g" cx="40%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fde4ea" />
            <stop offset="100%" stopColor="#f6b9c8" />
          </radialGradient>
        </defs>

        {/* Mũi tên chỉ lên */}
        <g className="stt-arrow">
          <path d="M23 13l9-9 9 9" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Mochi */}
        <g transform="translate(0 22)">
          <g className={jumping ? "stt-jump" : "stt-body"}>
            <path d="M32 4C49 4 61 18 61 33c0 13-12 19-29 19S3 46 3 33C3 18 15 4 32 4Z" fill="url(#stt-g)" stroke="#e994aa" strokeWidth="2" />
            <ellipse cx="22" cy="14" rx="7" ry="3.5" fill="#fff" opacity=".8" transform="rotate(-20 22 14)" />
            <g className="stt-eyes">
              <circle cx="23" cy="31" r="2.8" fill="#3b2a2e" />
              <circle cx="41" cy="31" r="2.8" fill="#3b2a2e" />
              <circle cx="23.9" cy="30" r=".9" fill="#fff" />
              <circle cx="41.9" cy="30" r=".9" fill="#fff" />
            </g>
            <g className="stt-happy" fill="none" stroke="#3b2a2e" strokeWidth="2.4" strokeLinecap="round">
              <path d="M19.5 32q3.5-5 7 0" />
              <path d="M37.5 32q3.5-5 7 0" />
            </g>
            <path d="M28.5 37q3.5 3.4 7 0" stroke="#3b2a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="16.5" cy="38" rx="4" ry="2.4" fill="#f48aa6" opacity=".55" />
            <ellipse cx="47.5" cy="38" rx="4" ry="2.4" fill="#f48aa6" opacity=".55" />
          </g>
        </g>
      </svg>
    </button>
  );
}
