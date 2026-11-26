import { NextResponse } from "next/server";
import { getReleases } from "@/lib/data";

/** Tìm nhanh cho bảng tìm kiếm: /api/search?q=... (q rỗng → phim mới cập nhật) */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const list = await getReleases({ q: q || undefined, limit: q ? 8 : 6 });
  const items = list.map(({ id, slug, title, title_jp, cover_url, status, total_episodes, year }) => ({
    id,
    slug,
    title,
    title_jp,
    cover_url,
    status,
    total_episodes,
    year,
  }));
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } },
  );
}
