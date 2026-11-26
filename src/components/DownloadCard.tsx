import type { Torrent } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { QualityBadge } from "./LatestTorrents";
import { TorrentActions } from "./TorrentActions";
import { SteamingMochi } from "./SteamingMochi";
import { IconDownload } from "./Icons";

/** Thẻ tải duy nhất của một bộ phim. */
export function DownloadCard({ torrent }: { torrent: Torrent | null }) {
  if (!torrent) {
    return (
      <div className="flex flex-col items-center rounded-[2rem] bg-surface py-12 text-center ring-1 ring-line">
        <SteamingMochi className="h-24 w-24" />
        <p className="mt-3 font-display font-extrabold">Bánh đang hấp…</p>
        <p className="text-sm text-muted">Bánh chưa có chín. Quay lại sau nhé!</p>
      </div>
    );
  }

  const info = [torrent.sub_type, torrent.size].filter(Boolean) as string[];

  return (
    <div className="shadow-mochi relative overflow-hidden rounded-[2rem] bg-surface p-5 ring-1 ring-line sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sakura/25 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sakura to-sakura-deep text-white shadow-lg">
            <IconDownload className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-black">{torrent.label}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <QualityBadge q={torrent.quality} />
              {info.map((x) => (
                <span key={x}>{x}</span>
              ))}
              <span>· cập nhật {timeAgo(torrent.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <TorrentActions magnet={torrent.magnet} torrentUrl={torrent.torrent_url} releaseId={torrent.release_id} />
        </div>
      </div>
    </div>
  );
}
