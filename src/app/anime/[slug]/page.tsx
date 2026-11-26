import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getRelease, getReleases } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/utils";
import { Cover } from "@/components/Cover";
import { DownloadCard } from "@/components/DownloadCard";
import { StaffList } from "@/components/StaffList";
import { MochiGate } from "@/components/MochiGate";
import { AnimeCard } from "@/components/AnimeCard";
import { Section } from "@/components/Section";
import { IconChevron } from "@/components/Icons";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

// Dựng sẵn 50 bộ mới nhất lúc build, các bộ khác dựng lần đầu khi có người xem rồi cache (ISR)
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.slice(0, 50).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRelease(slug);
  if (!r) return { title: "Không tìm thấy" };
  const desc = r.synopsis?.slice(0, 160) ?? `Tải ${r.title} Vietsub — Mochi Fansub`;
  return {
    title: `${r.title} Vietsub`,
    description: desc,
    openGraph: { title: r.title, description: desc, images: r.cover_url ? [r.cover_url] : undefined },
  };
}

export default async function AnimePage({ params }: { params: Params }) {
  const { slug } = await params;
  const r = await getRelease(slug);
  if (!r) notFound();

  const related = r.genres[0]
    ? (await getReleases({ genre: r.genres[0], limit: 7 })).filter((x) => x.id !== r.id).slice(0, 6)
    : [];

  const torrent = r.torrents?.[0] ?? null;

  const meta = [
    r.year && `${r.season ? `${r.season} ` : ""}${r.year}`,
    r.total_episodes && `${r.total_episodes} tập`,
    STATUS_LABEL[r.status],
  ].filter(Boolean) as string[];

  return (
    <div>
      {/* Banner */}
      <div className="relative -mt-16 h-[17rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)] md:-mt-[4.5rem] md:h-[24rem]">
        <Cover
          src={r.banner_url ?? r.cover_url}
          title={r.title}
          titleJp={r.title_jp}
          variant="banner"
          priority
          sizes="100vw"
          className={!r.banner_url && r.cover_url ? "scale-125 blur-3xl" : ""}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 to-transparent" />
      </div>

      <div className="relative mx-auto -mt-36 max-w-7xl px-4 sm:px-6 md:-mt-44">
        <nav aria-label="breadcrumb" className="mb-4 flex items-center gap-1 text-xs font-bold text-muted">
          <Link href="/" className="hover:text-sakura-deep">Trang chủ</Link>
          <IconChevron className="h-3.5 w-3.5" />
          <Link href="/browse" className="hover:text-sakura-deep">Khám phá</Link>
          <IconChevron className="h-3.5 w-3.5" />
          <span className="truncate text-ink">{r.title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-[15rem_1fr] lg:grid-cols-[17rem_1fr] lg:gap-12">
          {/* Poster */}
          <div className="animate-rise mx-auto w-44 md:mx-0 md:w-full">
            <div className="shadow-mochi relative aspect-[2/3] overflow-hidden rounded-[2rem] ring-4 ring-surface">
              <Cover src={r.cover_url} title={r.title} titleJp={r.title_jp} sizes="(max-width: 768px) 176px, 272px" priority />
            </div>
          </div>

          {/* Thông tin */}
          <div className="min-w-0 text-center md:pt-24 md:text-left">
            {r.title_jp && (
              <p className="font-jp text-sm font-bold tracking-[0.25em] text-sakura-deep">{r.title_jp}</p>
            )}
            <h1 className="mt-1 font-display text-3xl font-black leading-tight tracking-tight md:text-5xl">{r.title}</h1>

            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {meta.map((m) => (
                <span key={m} className="rounded-full bg-surface px-3 py-1 text-xs font-extrabold ring-1 ring-line">
                  {m}
                </span>
              ))}
              {r.genres.map((g) => (
                <Link
                  key={g}
                  href={`/browse?genre=${encodeURIComponent(g)}`}
                  className="press rounded-full bg-sakura/20 px-3 py-1 text-xs font-extrabold text-sakura-deep hover:bg-sakura/35"
                >
                  {g}
                </Link>
              ))}
            </div>

            {r.synopsis && (
              <p className="mx-auto mt-5 max-w-3xl whitespace-pre-line text-left leading-relaxed text-ink/85 md:mx-0">
                {r.synopsis}
              </p>
            )}

            {r.staff && r.staff.length > 0 && (
              <div className="mt-8 text-left">
                <StaffList staff={r.staff} />
              </div>
            )}

            <div className="mt-8 text-left">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-8 w-2.5 rounded-full bg-gradient-to-b from-matcha to-matcha-deep" aria-hidden />
                <h2 className="font-display text-xl font-black md:text-2xl">Mua bánh ở đây</h2>
              </div>
              {torrent ? (
                <MochiGate key={r.id}>
                  <DownloadCard torrent={torrent} />
                  <p className="mt-3 text-xs text-muted">
                    Mẹo: dùng qBittorrent hoặc uTorrent. Nhấn <b>Magnet</b> để mở trực tiếp, hoặc sao chép link.
                  </p>
                </MochiGate>
              ) : (
                <DownloadCard torrent={null} />
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <Section title="Có thể bạn sẽ thích" jp="おすすめ">
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {related.map((x) => (
                <AnimeCard key={x.id} r={x} />
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
