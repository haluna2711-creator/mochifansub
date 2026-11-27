"use client";

import { useEffect, useState } from "react";
import { hueFrom } from "@/lib/utils";

/** Ảnh đại diện thành viên: có link ảnh thì hiện ảnh, không (hoặc ảnh lỗi) thì hiện chữ cái đầu. */
export function UserAvatar({
  name,
  src,
  className = "h-10 w-10",
  onLoadChange,
}: {
  name: string;
  src?: string | null;
  className?: string;
  /** Báo ảnh tải được (true) hay lỗi (false) — dùng cho phần xem trước ở trang hồ sơ */
  onLoadChange?: (ok: boolean) => void;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onLoad={() => onLoadChange?.(true)}
        onError={() => {
          setFailed(true);
          onLoadChange?.(false);
        }}
        className={`${className} shrink-0 rounded-full bg-surface-2 object-cover ring-1 ring-line`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${className} grid shrink-0 place-items-center rounded-full font-display font-black text-white`}
      style={{ background: `hsl(${hueFrom(name)} 65% 68%)` }}
    >
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}
