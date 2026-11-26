/** Bánh mochi đang hấp trong xửng tre: nảy nhẹ, chớp mắt, hơi nước bay lên. */
export function SteamingMochi({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={`text-sakura-deep ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id="sm-g" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#fde4ea" />
          <stop offset="100%" stopColor="#f6b9c8" />
        </radialGradient>
      </defs>
      <style>{`
        .sm-bounce { transform-box: fill-box; transform-origin: 50% 100%; animation: sm-bounce 2.4s var(--ease-mochi, ease-in-out) infinite; }
        .sm-eyes { transform-box: fill-box; transform-origin: 50% 50%; animation: sm-blink 4s ease-in-out infinite; }
        .sm-steam { animation: sm-steam 2.6s ease-out infinite; }
        .sm-twinkle { transform-box: fill-box; transform-origin: 50% 50%; animation: sm-twinkle 2.4s ease-in-out infinite; }
        @keyframes sm-bounce {
          0%, 100% { transform: scale(1, 1); }
          25% { transform: scale(1.07, 0.92); }
          55% { transform: translateY(-4px) scale(0.97, 1.05); }
          80% { transform: scale(1.02, 0.98); }
        }
        @keyframes sm-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          94% { transform: scaleY(0.1); }
        }
        @keyframes sm-steam {
          0% { opacity: 0; transform: translateY(8px); }
          30% { opacity: 0.75; }
          100% { opacity: 0; transform: translateY(-14px); }
        }
        @keyframes sm-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(25deg); }
        }
      `}</style>

      {/* Hơi nước */}
      {[
        { x: 40, d: "0s" },
        { x: 60, d: "0.9s" },
        { x: 80, d: "1.7s" },
      ].map((w) => (
        <g key={w.x} transform={`translate(${w.x} 30)`}>
          <g className="sm-steam" style={{ animationDelay: w.d }} opacity={0.5}>
            <path
              d="M0 0q-5-6 0-12t0-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        </g>
      ))}

      {/* Lấp lánh */}
      <path
        className="sm-twinkle"
        d="M22 40l1.6 4.2 4.2 1.6-4.2 1.6L22 51.6l-1.6-4.2-4.2-1.6 4.2-1.6Z"
        fill="#f9c74f"
        style={{ animationDelay: "0.3s" }}
      />
      <path
        className="sm-twinkle"
        d="M98 48l1.2 3.2 3.2 1.2-3.2 1.2L98 56.8l-1.2-3.2-3.2-1.2 3.2-1.2Z"
        fill="#f9c74f"
        style={{ animationDelay: "1.3s" }}
      />

      {/* Mochi */}
      <g transform="translate(31.2 29.2) scale(0.9)">
        <g className="sm-bounce">
          <path
            d="M32 4C49 4 61 18 61 33c0 13-12 19-29 19S3 46 3 33C3 18 15 4 32 4Z"
            fill="url(#sm-g)"
            stroke="#e994aa"
            strokeWidth="2"
          />
          <ellipse cx="22" cy="14" rx="7" ry="3.5" fill="#fff" opacity=".8" transform="rotate(-20 22 14)" />
          <g className="sm-eyes">
            <circle cx="23" cy="31" r="2.6" fill="#3b2a2e" />
            <circle cx="41" cy="31" r="2.6" fill="#3b2a2e" />
            <circle cx="23.9" cy="30" r=".8" fill="#fff" />
            <circle cx="41.9" cy="30" r=".8" fill="#fff" />
          </g>
          <path d="M29 35.5q3 3 6 0" stroke="#3b2a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="17" cy="37" rx="4" ry="2.4" fill="#f48aa6" opacity=".55" />
          <ellipse cx="47" cy="37" rx="4" ry="2.4" fill="#f48aa6" opacity=".55" />
        </g>
      </g>

      {/* Xửng tre */}
      <rect x="22" y="74" width="76" height="26" rx="7" fill="#f1d9a6" stroke="#cfa56a" strokeWidth="2" />
      <g stroke="#cfa56a" strokeWidth="1.6" strokeLinecap="round" opacity=".75">
        <path d="M38 80v14M50 80v14M62 80v14M74 80v14M86 80v14" />
      </g>
      <rect x="18" y="68" width="84" height="9" rx="4.5" fill="#e3bd7e" stroke="#cfa56a" strokeWidth="2" />
      <rect x="18" y="96" width="84" height="8" rx="4" fill="#e3bd7e" stroke="#cfa56a" strokeWidth="2" />
    </svg>
  );
}
