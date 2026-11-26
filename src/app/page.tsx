import { getAllGenres, getFeatured, getReleases } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import { HeroCarousel } from "@/components/HeroCarousel";
import { AnimeCard, AnimeGrid } from "@/components/AnimeCard";
import { GenreChips, Section } from "@/components/Section";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, ongoing, completed, genres] = await Promise.all([
    getFeatured(),
    getReleases({ limit: 12 }),
    getReleases({ status: "ongoing", limit: 12 }),
    getReleases({ status: "completed", limit: 6 }),
    getAllGenres(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 md:pt-4">
      {!isSupabaseConfigured && (
        <p className="mb-4 rounded-2xl bg-yuzu/25 px-4 py-2.5 text-center text-sm font-semibold text-ink ring-1 ring-yuzu/50">
          🍡 Đang hiển thị dữ liệu mẫu — thêm biến môi trường Supabase để dùng dữ liệu thật.
        </p>
      )}

      <div className="animate-rise">
        <HeroCarousel items={featured} />
      </div>

      {genres.length > 0 && (
        <div className="mt-8">
          <GenreChips genres={genres.slice(0, 12)} />
        </div>
      )}

      <div>
        <Section title="Bánh mới hấp" jp="新着" href="/browse">
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4">
            {latest.slice(0, 8).map((r, i) => (
              <AnimeCard key={r.id} r={r} priority={i < 4} />
            ))}
          </div>
        </Section>
      </div>

      {ongoing.length > 0 && (
        <Section title="Đang hấp" jp="放送中" href="/browse?status=ongoing">
          <div className="snap-row -mx-4 auto-cols-[42%] gap-4 px-4 pb-4 sm:auto-cols-[28%] md:auto-cols-[20%] lg:auto-cols-[calc((100%-5*1rem)/6)] sm:mx-0 sm:px-0 [scroll-padding-inline:1rem] sm:[scroll-padding-inline:0]">
            {ongoing.map((r) => (
              <AnimeCard key={r.id} r={r} />
            ))}
          </div>
        </Section>
      )}

      {completed.length > 0 && (
        <Section title="Bánh đủ vị — ăn là ghiền" jp="完結" href="/browse?status=completed">
          <AnimeGrid items={completed} />
        </Section>
      )}
    </div>
  );
}
