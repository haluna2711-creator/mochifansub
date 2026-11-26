"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { getBrowserSupabase } from "@/lib/supabase";
import { IconCheck, IconCopy, IconDownload, IconMagnet } from "./Icons";

function Toast({ text }: { text: string }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-[60] flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-bg shadow-xl md:bottom-8"
      style={{ animation: "toast-in .45s var(--ease-mochi) both" }}
    >
      <IconCheck /> {text}
    </div>,
    document.body,
  );
}

/** Mỗi trình duyệt chỉ tính 1 lượt tải / phim / 24 giờ để tránh bấm nhiều lần làm sai số liệu. */
function countDownload(releaseId?: string) {
  if (!releaseId) return;
  const key = `mochi-dl-${releaseId}`;
  try {
    const last = Number(localStorage.getItem(key) ?? 0);
    if (Date.now() - last < 24 * 3600 * 1000) return;
    localStorage.setItem(key, String(Date.now()));
  } catch {}
  getBrowserSupabase()
    ?.rpc("increment_download", { p_release_id: releaseId })
    .then(({ error }) => {
      if (error) console.warn("increment_download", error.message);
    });
}

export function TorrentActions({
  magnet,
  torrentUrl,
  releaseId,
  compact = false,
}: {
  magnet: string | null;
  torrentUrl: string | null;
  releaseId?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!magnet) return;
    try {
      await navigator.clipboard.writeText(magnet);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = magnet;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const btn =
    "press inline-flex items-center justify-center gap-1.5 rounded-full font-extrabold whitespace-nowrap";
  const size = compact ? "h-9 px-3 text-xs" : "h-10 px-4 text-sm";

  return (
    <div className="flex items-center gap-1.5">
      {magnet && (
        <a
          href={magnet}
          onClick={() => countDownload(releaseId)}
          className={`${btn} ${size} bg-sakura-deep text-white shadow-[0_6px_16px_-6px] shadow-sakura-deep/60 hover:brightness-110`}
          title="Mở bằng uTorrent / qBittorrent"
        >
          <IconMagnet /> <span className={compact ? "hidden sm:inline" : ""}>Magnet</span>
        </a>
      )}
      {torrentUrl && (
        <a
          href={torrentUrl}
          onClick={() => countDownload(releaseId)}
          className={`${btn} ${size} bg-matcha text-white hover:brightness-105`}
          title="Tải file .torrent"
          rel="nofollow noopener"
          target="_blank"
        >
          <IconDownload /> <span className={compact ? "hidden sm:inline" : ""}>.torrent</span>
        </a>
      )}
      {magnet && (
        <button
          type="button"
          onClick={copy}
          aria-label="Sao chép magnet"
          title="Sao chép magnet"
          className={`${btn} ${compact ? "h-9 w-9" : "h-10 w-10"} bg-surface-2 text-ink ring-1 ring-line hover:bg-bg-2`}
        >
          {copied ? <IconCheck className="h-4 w-4 text-matcha-deep" /> : <IconCopy />}
        </button>
      )}
      {copied && <Toast text="Đã sao chép magnet!" />}
    </div>
  );
}
