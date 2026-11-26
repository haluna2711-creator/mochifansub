"use client";

import { useEffect, useState } from "react";

/** Email nhận báo lỗi bánh. Đổi thành email của tiệm. */
const REPORT_EMAIL = "haluna2711@gmail.com";

export function ReportButton({
  title,
  detail,
}: {
  /** Tên bánh (phim) đang xem */
  title: string;
  /** Thông tin bản tải, ví dụ "Trọn bộ · 720p · Hardsub · 16GB" */
  detail?: string;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);

  const subject = `[Báo lỗi bánh] ${title}`;
  const body = [
    "Chào Tiệm bánh Mochi,",
    "",
    "Mình muốn báo lỗi bánh:",
    `- Bánh: ${title}`,
    detail ? `- Bản tải: ${detail}` : "",
    url ? `- Link trang: ${url}` : "",
    "",
    "Lỗi gặp phải (link hỏng / hết seed / sai phụ đề / khác):",
    "",
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");

  const href = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <a
      href={href}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sakura-deep/30 bg-surface px-3.5 py-1.5 text-xs font-bold text-sakura-deep transition-colors hover:bg-sakura/20"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 21V4" />
        <path d="M5 4h11l-2 4 2 4H5" />
      </svg>
      Báo lỗi bánh
    </a>
  );
}
