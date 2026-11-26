import Link from "next/link";
import type { TorrentWithRelease } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Cover } from "./Cover";
import { TorrentActions } from "./TorrentActions";

export function QualityBadge({ q }: { q: string | null }) {
  if (!q) return null;
  const hi = /1080|2160|4k/i.test(q);
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[0.65rem] font-black tracking-wide ${
        hi ? "bg-sakura/30 text-sakura-deep" : "bg-matcha/25 text-matcha-deep"
      }`}
    >
      {q}
    </span>
  );
}

export function LatestTorrents({ items }: { items: TorrentWithRelease[] }) {
  if (!items.length) return null;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-mochi)] bg-surface ring-1 ring-line shadow-mochi">
      {items.map((t) => (
        <li key={t.id} className="flex items-center gap-3 p-3 transition-colors hover:bg-surface-2 sm:gap-4 sm:p-4">
          <Link
            href={t.release ? `/anime/${t.release.slug}` : "#"}
            prefetch={false}
            className="relative aspect-[2/3] w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-line sm:w-12"
          >
            <Cover src={t.release?.cover_url ?? null} title={t.release?.title ?? ""} sizes="48px" showTitle={false} />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={t.release ? `/anime/${t.release.slug}` : "#"}
              prefetch={false}
              className="block truncate font-display text-sm font-bold hover:text-sakura-deep sm:text-[0.95rem]"
            >
              {t.release?.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <span className="font-bold text-ink">{t.label}</span>
              <QualityBadge q={t.quality} />
              {t.size && <span>{t.size}</span>}
              <span aria-hidden>·</span>
              <span>{timeAgo(t.created_at)}</span>
            </div>
          </div>
          <TorrentActions magnet={t.magnet} torrentUrl={t.torrent_url} compact />
        </li>
      ))}
    </ul>
  );
}
