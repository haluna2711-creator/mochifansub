"use client";

import { useMemo, useState } from "react";
import type { Torrent } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { QualityBadge } from "./LatestTorrents";
import { TorrentActions } from "./TorrentActions";
import { MochiFace } from "./MochiLogo";

export function TorrentList({ torrents }: { torrents: Torrent[] }) {
  const qualities = useMemo(
    () => [...new Set(torrents.map((t) => t.quality).filter(Boolean))] as string[],
    [torrents],
  );
  const [q, setQ] = useState<string | null>(null);
  const [asc, setAsc] = useState(false);

  const list = useMemo(() => {
    const l = torrents.filter((t) => !q || t.quality === q);
    return [...l].sort((a, b) => {
      const d = (a.episode ?? 0) - (b.episode ?? 0) || a.created_at.localeCompare(b.created_at);
      return asc ? d : -d;
    });
  }, [torrents, q, asc]);

  if (!torrents.length) {
    return (
      <div className="flex flex-col items-center rounded-[2rem] bg-surface py-14 text-center ring-1 ring-line">
        <MochiFace className="animate-wobble h-16 w-16" />
        <p className="mt-3 font-display font-extrabold">Bánh đang hấp…</p>
        <p className="text-sm text-muted">Chưa có link tải. Quay lại sau nhé!</p>
      </div>
    );
  }

  const chip = (active: boolean) =>
    `press rounded-full px-3.5 py-1.5 text-xs font-extrabold ring-1 ${
      active ? "bg-ink text-bg ring-ink" : "bg-surface text-ink ring-line hover:bg-surface-2"
    }`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {qualities.length > 1 && (
          <>
            <button type="button" className={chip(!q)} onClick={() => setQ(null)}>
              Tất cả
            </button>
            {qualities.map((x) => (
              <button key={x} type="button" className={chip(q === x)} onClick={() => setQ(x)}>
                {x}
              </button>
            ))}
          </>
        )}
        <button
          type="button"
          onClick={() => setAsc((v) => !v)}
          className="press ml-auto rounded-full bg-surface px-3.5 py-1.5 text-xs font-extrabold text-muted ring-1 ring-line hover:text-ink"
        >
          {asc ? "Tập cũ → mới ↑" : "Tập mới → cũ ↓"}
        </button>
      </div>

      <ul className="shadow-mochi divide-y divide-line overflow-hidden rounded-[var(--radius-mochi)] bg-surface ring-1 ring-line">
        {list.map((t) => {
          const isBatch = /batch|trọn/i.test(t.label);
          return (
            <li
              key={t.id}
              className={`flex items-center gap-3 p-3.5 transition-colors hover:bg-surface-2 sm:p-4 ${
                isBatch ? "bg-gradient-to-r from-yuzu/15 to-transparent" : ""
              }`}
            >
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-display text-sm font-black ${
                  isBatch ? "bg-yuzu text-[#5a4300]" : "bg-sakura/25 text-sakura-deep"
                }`}
              >
                {isBatch ? "全" : t.episode != null ? String(t.episode).padStart(2, "0") : "★"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{t.label}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <QualityBadge q={t.quality} />
                  {t.sub_type && <span>{t.sub_type}</span>}
                  {t.size && <span>· {t.size}</span>}
                  <span>· {timeAgo(t.created_at)}</span>
                </div>
              </div>
              <TorrentActions magnet={t.magnet} torrentUrl={t.torrent_url} compact />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
