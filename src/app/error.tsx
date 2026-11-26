"use client";

import Link from "next/link";
import { MochiFace } from "@/components/MochiLogo";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <MochiFace className="animate-wobble h-28 w-28" mood="sad" />
      <h1 className="mt-6 font-display text-3xl font-black">Ối, có lỗi rồi…</h1>
      <p className="mt-2 text-muted">Mochi bị dính nồi mất rồi. Bạn thử tải lại trang nhé.</p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="press rounded-full bg-sakura-deep px-6 py-3 font-extrabold text-white shadow-lg"
        >
          Thử lại
        </button>
        <Link href="/" className="press rounded-full bg-surface px-6 py-3 font-extrabold ring-1 ring-line">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
