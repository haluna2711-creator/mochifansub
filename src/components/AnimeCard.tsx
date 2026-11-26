import Link from "next/link";
import type { Release } from "@/lib/types";
import { STATUS_LABEL, timeAgo } from "@/lib/utils";
import { Cover } from "./Cover";

const statusStyle = {
  ongoing: "bg-matcha text-white",
  completed: "bg-sakura-deep text-white",
  upcoming: "bg-yuzu text-[#5a4300]",
} as const;

export function AnimeCard({ r, priority = false }: { r: Release; priority?: boolean }) {
  return (
    <Link
      href={`/anime/${r.slug}`}
      prefetch={false}
      className="squish group block rounded-[var(--radius-mochi)] outline-none"
    >
      <div className="shadow-mochi relative aspect-[2/3] overflow-hidden rounded-[var(--radius-mochi)] bg-surface-2 ring-1 ring-line">
        <Cover
          src={r.cover_url}
          title={r.title}
          titleJp={r.title_jp}
          priority={priority}
          showTitle={false}
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 220px"
          className="transition-transform duration-700 group-hover:scale-105"
        />
        <span
          className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold shadow-sm ${statusStyle[r.status]}`}
        >
          {STATUS_LABEL[r.status]}
        </span>
        {r.total_episodes ? (
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/45 px-2 py-0.5 text-[0.68rem] font-bold text-white backdrop-blur-sm">
            {r.total_episodes} bánh
          </span>
        ) : null}
        <div className="pointer-events-none absolute inset-0 rounded-[var(--radius-mochi)] ring-1 ring-inset ring-white/30" />
      </div>
      <div className="px-1.5 pt-3">
        <h3 className="line-clamp-2 font-display text-[0.95rem] font-bold leading-snug text-ink transition-colors group-hover:text-sakura-deep">
          {r.title}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
          {r.title_jp && <span className="truncate font-jp">{r.title_jp}</span>}
          {r.title_jp && <span aria-hidden>·</span>}
          <span className="shrink-0">{timeAgo(r.updated_at)}</span>
        </p>
      </div>
    </Link>
  );
}

export function AnimeGrid({ items, priorityCount = 0 }: { items: Release[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((r, i) => (
        <div key={r.id} className={i >= 12 ? "cv-auto" : undefined}>
          <AnimeCard r={r} priority={i < priorityCount} />
        </div>
      ))}
    </div>
  );
}

export function AnimeGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[2/3] rounded-[var(--radius-mochi)]" />
          <div className="skeleton mx-1.5 mt-3 h-4 w-4/5 rounded-full" />
          <div className="skeleton mx-1.5 mt-2 h-3 w-1/2 rounded-full" />
        </div>
      ))}
    </div>
  );
}
