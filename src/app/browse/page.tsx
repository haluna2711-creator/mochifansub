import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAllGenres, getReleases } from "@/lib/data";
import type { ReleaseStatus } from "@/lib/types";
import { AnimeGrid } from "@/components/AnimeCard";
import { GenreChips } from "@/components/Section";
import { SearchBar } from "@/components/SearchBar";
import { StatusTabs } from "@/components/StatusTabs";
import { MochiFace } from "@/components/MochiLogo";

export const metadata: Metadata = { title: "Tủ bánh" };

const tabs: { key?: ReleaseStatus; label: string }[] = [
  { label: "Tất cả" },
  { key: "ongoing", label: "Đang hấp" },
  { key: "completed", label: "Bánh đủ vị" },
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
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">Tham quan tiệm bánh</h1>
      </div>

      <div className="mt-6 max-w-2xl">
        <Suspense fallback={<div className="skeleton h-14 rounded-full" />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="no-scrollbar -mx-4 mt-6 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <StatusTabs
          active={status}
          tabs={tabs.map((t) => ({ key: t.key, label: t.label, href: href(t.key) }))}
        />
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
          <MochiFace className="animate-wobble h-20 w-20" mood="sad" />
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
