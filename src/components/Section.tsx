import Link from "next/link";
import { IconArrow } from "./Icons";

export function Section({
  id,
  title,
  jp,
  href,
  children,
}: {
  id?: string;
  title: string;
  jp?: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-24 md:mt-20">
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
        <div className="flex items-center gap-3">
          <span className="h-9 w-2.5 rounded-full bg-gradient-to-b from-sakura to-sakura-deep" aria-hidden />
          <div>
            {jp && <p className="font-jp text-xs font-bold tracking-[0.3em] text-sakura-deep">{jp}</p>}
            <h2 className="font-display text-2xl font-black tracking-tight md:text-[1.75rem]">{title}</h2>
          </div>
        </div>
        {href && (
          <Link
            href={href}
            className="press group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-sm font-bold text-ink ring-1 ring-line hover:bg-sakura/20 hover:text-sakura-deep"
          >
            Xem tất cả <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function GenreChips({ genres, active, base = "/browse" }: { genres: string[]; active?: string; base?: string }) {
  const emoji = ["🌸", "🍡", "🍵", "⭐", "🎐", "🌙", "🍙", "🎏", "🦊", "🍰", "🎋", "🐰"];
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link
        href={base}
        className={`press shrink-0 rounded-full px-4 py-2 text-sm font-bold ring-1 ${
          !active ? "bg-ink text-bg ring-ink" : "bg-surface text-ink ring-line hover:bg-surface-2"
        }`}
      >
        Tất cả
      </Link>
      {genres.map((g, i) => (
        <Link
          key={g}
          href={`${base}?genre=${encodeURIComponent(g)}`}
          className={`press shrink-0 rounded-full px-4 py-2 text-sm font-bold ring-1 ${
            active === g ? "bg-sakura-deep text-white ring-sakura-deep" : "bg-surface text-ink ring-line hover:bg-sakura/20"
          }`}
        >
          <span className="mr-1" aria-hidden>{emoji[i % emoji.length]}</span>
          {g}
        </Link>
      ))}
    </div>
  );
}
