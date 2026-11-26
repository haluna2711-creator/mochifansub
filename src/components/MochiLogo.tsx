export function MochiFace({ className = "", blush = true }: { className?: string; blush?: boolean }) {
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
      <circle cx="23" cy="31" r="2.6" fill="#3b2a2e" />
      <circle cx="41" cy="31" r="2.6" fill="#3b2a2e" />
      <path d="M29 35.5q3 3 6 0" stroke="#3b2a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
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
