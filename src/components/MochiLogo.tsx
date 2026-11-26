export function MochiFace({
  className = "",
  blush = true,
  mood = "happy",
}: {
  className?: string;
  blush?: boolean;
  /** happy: mặt cười · sad: mặt buồn (dùng khi lỗi / không có kết quả) */
  mood?: "happy" | "sad";
}) {
  const sad = mood === "sad";
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="mochi-g" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#fde4ea" />
          <stop offset="100%" stopColor="#f6b9c8" />
        </radialGradient>
      </defs>
      <path
        d="M32 4C49 4 61 18 61 33c0 13-12 19-29 19S3 46 3 33C3 18 15 4 32 4Z"
        fill="url(#mochi-g)"
        stroke="#e994aa"
        strokeWidth="2"
      />
      <ellipse cx="22" cy="14" rx="7" ry="3.5" fill="#fff" opacity=".8" transform="rotate(-20 22 14)" />
      {sad ? (
        <>
          {/* mắt tròn ngấn nước */}
          <ellipse cx="23" cy="30" rx="3.2" ry="3.7" fill="#3b2a2e" />
          <ellipse cx="41" cy="30" rx="3.2" ry="3.7" fill="#3b2a2e" />
          <circle cx="24.2" cy="28.5" r="1.2" fill="#fff" />
          <circle cx="42.2" cy="28.5" r="1.2" fill="#fff" />
          <circle cx="21.9" cy="31.6" r=".6" fill="#fff" opacity=".85" />
          <circle cx="39.9" cy="31.6" r=".6" fill="#fff" opacity=".85" />
          {/* miệng mếu nhỏ */}
          <path d="M28.5 41q3.5-3.4 7 0" stroke="#3b2a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* giọt nước mắt */}
          <path d="M21.5 35.5c-1.7 2.8-2.5 4.3-2.5 5.5a2.5 2.5 0 0 0 5 0c0-1.2-.8-2.7-2.5-5.5Z" fill="#8ec9f0" stroke="#5fa8d9" strokeWidth=".8" />
          <ellipse cx="20.6" cy="41.4" rx=".6" ry=".9" fill="#fff" opacity=".8" />
        </>
      ) : (
        <>
          <circle cx="23" cy="31" r="2.6" fill="#3b2a2e" />
          <circle cx="41" cy="31" r="2.6" fill="#3b2a2e" />
          <path d="M29 35.5q3 3 6 0" stroke="#3b2a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {blush && !sad && (
        <>
          <ellipse cx="17" cy="37" rx="4" ry="2.4" fill="#f48aa6" opacity=".55" />
          <ellipse cx="47" cy="37" rx="4" ry="2.4" fill="#f48aa6" opacity=".55" />
        </>
      )}
    </svg>
  );
}

export function MochiLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid h-10 w-10 place-items-center">
        <MochiFace className="h-10 w-10 drop-shadow-sm transition-transform duration-500 [transition-timing-function:var(--ease-mochi)] group-hover:scale-110 group-hover:-rotate-6" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[1.15rem] font-extrabold tracking-tight text-ink">
          Mochi<span className="text-sakura-deep"> Fansub</span>
        </span>
      </span>
    </span>
  );
}
