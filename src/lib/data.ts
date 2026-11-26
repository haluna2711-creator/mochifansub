import { getServerSupabase } from "./supabase";
import { demoReleases, demoTorrents } from "./demo";
import { normalize } from "./utils";
import type { Release, ReleaseStatus, ReleaseWithTorrents, Torrent, TorrentWithRelease } from "./types";

export interface ReleaseQuery {
  q?: string;
  genre?: string;
  status?: ReleaseStatus;
  limit?: number;
}

const RELEASE_COLS =
  "id,slug,title,title_jp,synopsis,cover_url,banner_url,genres,year,season,status,total_episodes,featured,created_at,updated_at";

export async function getReleases(query: ReleaseQuery = {}): Promise<Release[]> {
  const sb = getServerSupabase();
  const { q, genre, status, limit = 60 } = query;

  if (!sb) {
    const nq = q ? normalize(q) : "";
    return demoReleases
      .filter((r) => (!genre || r.genres.includes(genre)) && (!status || r.status === status))
      .filter((r) => !nq || normalize(`${r.title} ${r.title_jp ?? ""}`).includes(nq))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, limit);
  }

  let req = sb.from("releases").select(RELEASE_COLS).order("updated_at", { ascending: false }).limit(limit);
  if (genre) req = req.contains("genres", [genre]);
  if (status) req = req.eq("status", status);
  if (q) {
    const safe = q.replace(/[%,()]/g, " ").trim();
    req = req.or(`title.ilike.%${safe}%,title_jp.ilike.%${safe}%`);
  }
  const { data, error } = await req;
  if (error) {
    console.error("getReleases", error.message);
    return [];
  }
  return (data ?? []) as Release[];
}

export async function getFeatured(): Promise<Release[]> {
  const sb = getServerSupabase();
  if (!sb) return demoReleases.filter((r) => r.featured);
  const { data } = await sb
    .from("releases")
    .select(RELEASE_COLS)
    .eq("featured", true)
    .order("updated_at", { ascending: false })
    .limit(6);
  if (data && data.length) return data as Release[];
  // Chưa đánh dấu nổi bật bộ nào → lấy 3 bộ mới nhất
  return getReleases({ limit: 3 });
}

export async function getRelease(slug: string): Promise<ReleaseWithTorrents | null> {
  const sb = getServerSupabase();
  if (!sb) {
    const r = demoReleases.find((x) => x.slug === slug);
    if (!r) return null;
    return { ...r, torrents: demoTorrents.filter((t) => t.release_id === r.id) };
  }
  const { data, error } = await sb
    .from("releases")
    .select(`${RELEASE_COLS}, torrents(*)`)
    .eq("slug", slug)
    .maybeSingle();
  if (error) console.error("getRelease", error.message);
  if (!data) return null;
  // Mỗi phim 1 link → Supabase trả về object hoặc null thay vì mảng; chuẩn hoá về mảng
  const raw = (data as { torrents?: Torrent[] | Torrent | null }).torrents;
  const torrents = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return { ...(data as unknown as Release), torrents };
}

export async function getLatestTorrents(limit = 10): Promise<TorrentWithRelease[]> {
  const sb = getServerSupabase();
  if (!sb) {
    return [...demoTorrents]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit)
      .map((t) => {
        const r = demoReleases.find((x) => x.id === t.release_id)!;
        return { ...t, release: { slug: r.slug, title: r.title, cover_url: r.cover_url, title_jp: r.title_jp } };
      });
  }
  const { data, error } = await sb
    .from("torrents")
    .select("*, release:releases(slug,title,cover_url,title_jp)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) console.error("getLatestTorrents", error.message);
  return (data ?? []) as TorrentWithRelease[];
}

export async function getAllGenres(): Promise<string[]> {
  const list = await getReleases({ limit: 500 });
  const counts = new Map<string, number>();
  list.forEach((r) => r.genres.forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g);
}

export async function getAllSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const sb = getServerSupabase();
  if (!sb) return demoReleases.map(({ slug, updated_at }) => ({ slug, updated_at }));
  const { data } = await sb.from("releases").select("slug,updated_at").limit(5000);
  return data ?? [];
}
