import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAllGenres, getReleases } from "@/lib/data";
import type { ReleaseStatus } from "@/lib/types";
import { AnimeGrid } from "@/components/AnimeCard";
import { GenreChips } from "@/components/Section";
import { SearchBar } from "@/components/SearchBar";
import { MochiFace } from "@/components/MochiLogo";

export const metadata: Metadata = { title: "Khám phá" };

const tabs: { key?: ReleaseStatus; label: string }[] = [
  { label: "Tất cả" },
  { key: "ongoing", label: "Đang tiến hành" },
  { key: "completed", label: "Hoàn thành" },
  { key: "upcoming", label: "Sắp ra mắt" },
];

type SP = Promise<{ q?: string; genre?: string; status?: string }>;

export default async function BrowsePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const status = tabs.find((t) => t.key === sp.status)?.key;
  const [items, genres] = await Promise.all([
    getReleases({ q: sp.q, genre: sp.genre, status, limit: 120 }),
    getAllGenres(),
  ]);

  const href = (s?: string) => {
    const p = new URLSearchParams();
    if (sp.q) p.set("q", sp.q);
    if (sp.genre) p.set("genre", sp.genre);
    if (s) p.set("status", s);
    return `/browse${p.size ? `?${p}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 md:pt-8">
      <div className="animate-rise">
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">Khám phá kho phim</h1>
      </div>

      <div className="mt-6 max-w-2xl">
        <Suspense fallback={<div className="skeleton h-14 rounded-full" />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="no-scrollbar -mx-4 mt-6 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex shrink-0 gap-1 rounded-full bg-surface p-1 ring-1 ring-line">
          {tabs.map((t) => {
            const active = t.key === status;
            return (
              <Link
                key={t.label}
                href={href(t.key)}
                scroll={false}
                className={`press whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${
                  active ? "bg-sakura-deep text-white shadow" : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {genres.length > 0 && (
        <div className="mt-4">
          <GenreChips genres={genres} active={sp.genre} />
        </div>
      )}

      <p className="mt-8 mb-5 text-sm font-semibold text-muted">
        {items.length} kết quả
        {sp.q && (
          <>
            {" "}cho <span className="text-ink">“{sp.q}”</span>
          </>
        )}
      </p>

      {items.length ? (
        <AnimeGrid items={items} priorityCount={6} />
      ) : (
        <div className="flex flex-col items-center rounded-[2rem] bg-surface py-16 text-center ring-1 ring-line">
          <MochiFace className="animate-wobble h-20 w-20" blush={false} />
          <p className="mt-4 font-display text-lg font-extrabold">Không tìm thấy phim nào</p>
          <p className="mt-1 text-sm text-muted">Thử từ khoá khác hoặc bỏ bớt bộ lọc nhé.</p>
          <Link href="/browse" className="press mt-5 rounded-full bg-sakura-deep px-5 py-2.5 text-sm font-extrabold text-white">
            Xoá bộ lọc
          </Link>
        </div>
      )}
    </div>
  );
}
