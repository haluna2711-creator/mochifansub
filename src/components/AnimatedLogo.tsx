/**
 * Logo động "Tiệm Bánh Mochi": bánh mochi nhảy lên rồi đáp xuống đỉnh dòng chữ,
 * các chữ cái gợn sóng lan ra từ chỗ bánh đáp, kèm vài tia lấp lánh.
 * Một vòng lặp 3,2 giây; người bật "giảm chuyển động" sẽ thấy logo đứng yên.
 */
const CYCLE = 3.2; // giây — khớp với thời gian trong khối <style> bên dưới
const LAND = 1.088; // thời điểm bánh chạm chữ = 34% của vòng lặp
const STEP = 0.055; // chữ càng xa tâm càng gợn trễ hơn một chút

export function AnimatedLogo({ text = "Tiệm Bánh Mochi", className = "" }: { text?: string; className?: string }) {
  const words = text.split(" ");
  const total = words.reduce((n, w) => n + [...w].length, 0);
  const center = (total - 1) / 2;
  let idx = 0;

  return (
    <h1 aria-label={text} className={`al flex flex-col items-center text-5xl sm:text-6xl md:text-7xl ${className}`}>
      <style>{`
        .al-mochi { transform-box: fill-box; transform-origin: 50% 100%; animation: al-hop ${CYCLE}s ease-in-out infinite; }
        .al-eyes { transform-box: fill-box; transform-origin: 50% 50%; animation: al-blink ${CYCLE}s ease-in-out infinite; }
        .al-smile { animation: al-smile ${CYCLE}s linear infinite; }
        .al-open { animation: al-open ${CYCLE}s linear infinite; }
        .al-letter { display: inline-block; animation: al-wave ${CYCLE}s ease-in-out infinite; }
        .al-spark { transform-box: fill-box; transform-origin: 50% 50%; opacity: 0; animation: al-spark ${CYCLE}s ease-out infinite; }
        @keyframes al-hop {
          0%, 50%, 100% { transform: translateY(0) scale(1, 1); }
          8%  { transform: translateY(0) scale(1.1, 0.88); }
          22% { transform: translateY(-34px) scale(0.92, 1.1); }
          34% { transform: translateY(0) scale(1.16, 0.82); }
          42% { transform: translateY(0) scale(0.97, 1.04); }
        }
        @keyframes al-blink {
          0%, 66%, 70%, 100% { transform: scaleY(1); }
          68% { transform: scaleY(0.1); }
        }
        @keyframes al-smile { 0%, 9% { opacity: 1; } 10%, 33% { opacity: 0; } 34%, 100% { opacity: 1; } }
        @keyframes al-open  { 0%, 9% { opacity: 0; } 10%, 33% { opacity: 1; } 34%, 100% { opacity: 0; } }
        @keyframes al-wave {
          0%, 32%, 100% { transform: translateY(0); }
          7%  { transform: translateY(6px); }
          16% { transform: translateY(-7px); }
          25% { transform: translateY(2.5px); }
        }
        @keyframes al-spark {
          0%, 33% { opacity: 0; transform: scale(0.3) rotate(0deg); }
          38% { opacity: 1; transform: scale(1.15) rotate(15deg); }
          54%, 100% { opacity: 0; transform: scale(0.6) rotate(45deg); }
        }
      `}</style>

      {/* Bánh mochi */}
      <span aria-hidden className="relative -mb-[0.18em] block aspect-[88/68] w-20 sm:w-24">
        <svg viewBox="-12 -8 88 68" className="absolute inset-0 h-full w-full overflow-visible drop-shadow-lg">
          <defs>
            <radialGradient id="al-g" cx="40%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#fde4ea" />
              <stop offset="100%" stopColor="#f6b9c8" />
            </radialGradient>
          </defs>
          <g className="al-mochi">
            <path d="M32 4C49 4 61 18 61 33c0 13-12 19-29 19S3 46 3 33C3 18 15 4 32 4Z" fill="url(#al-g)" stroke="#e994aa" strokeWidth="2" />
            <ellipse cx="22" cy="14" rx="7" ry="3.5" fill="#fff" opacity=".8" transform="rotate(-20 22 14)" />
            <g className="al-eyes">
              <circle cx="23" cy="31" r="2.6" fill="#3b2a2e" />
              <circle cx="41" cy="31" r="2.6" fill="#3b2a2e" />
              <circle cx="23.9" cy="30" r=".8" fill="#fff" />
              <circle cx="41.9" cy="30" r=".8" fill="#fff" />
            </g>
            <path className="al-smile" d="M29 35.5q3 3 6 0" stroke="#3b2a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse className="al-open" cx="32" cy="37" rx="2.4" ry="3" fill="#3b2a2e" />
            <ellipse cx="17" cy="37" rx="4" ry="2.4" fill="#f48aa6" opacity=".55" />
            <ellipse cx="47" cy="37" rx="4" ry="2.4" fill="#f48aa6" opacity=".55" />
          </g>
          {/* Tia lấp lánh khi bánh đáp xuống */}
          <path className="al-spark" d="M-6 40l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" fill="#ffd166" />
          <path className="al-spark" style={{ animationDelay: "0.05s" }} d="M70 44l1.2 3.2 3.2 1.2-3.2 1.2-1.2 3.2-1.2-3.2-3.2-1.2 3.2-1.2Z" fill="#ffd166" />
        </svg>
      </span>

      {/* Chữ */}
      <span aria-hidden className="font-display font-black text-white drop-shadow-[0_2px_24px_rgba(120,60,80,.6)]">
        {words.map((w, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {[...w].map((ch) => {
              const i = idx++;
              const delay = LAND + Math.abs(i - center) * STEP;
              return (
                <span key={i} className="al-letter" style={{ animationDelay: `${delay.toFixed(3)}s` }}>
                  {ch}
                </span>
              );
            })}
            {wi < words.length - 1 && <span className="inline-block w-[0.28em]" />}
          </span>
        ))}
      </span>
    </h1>
  );
}
