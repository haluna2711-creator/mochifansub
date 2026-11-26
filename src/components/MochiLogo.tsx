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
          {/* lông mày cụp */}
          <path d="M18.5 25.5l6.5-2" stroke="#3b2a2e" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M45.5 25.5l-6.5-2" stroke="#3b2a2e" strokeWidth="1.8" strokeLinecap="round" />
          {/* mắt nhắm buồn */}
          <path d="M19.5 31q3.5 2.6 7 0" stroke="#3b2a2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M37.5 31q3.5 2.6 7 0" stroke="#3b2a2e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* miệng mếu */}
          <path d="M28.5 39.5q3.5-3.2 7 0" stroke="#3b2a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* giọt nước mắt */}
          <path d="M21 35.5c-1.6 2.6-2.3 4-2.3 5.1a2.3 2.3 0 0 0 4.6 0c0-1.1-.7-2.5-2.3-5.1Z" fill="#8ec9f0" stroke="#5fa8d9" strokeWidth=".8" />
        </>
      ) : (
        <>
          <circle cx="23" cy="31" r="2.6" fill="#3b2a2e" />
          <circle cx="41" cy="31" r="2.6" fill="#3b2a2e" />
          <path d="M29 35.5q3 3 6 0" stroke="#3b2a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {blush && (
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
