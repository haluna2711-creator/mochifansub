import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { COMMENT_MAX, COMMENT_MIN, DEFAULT_NAME, NAME_MAX, UUID_RE, cleanText, type PublicComment } from "@/lib/comments";

export const dynamic = "force-dynamic";

const PAGE = 20;
const COLS = "id,author_name,content,reply,replied_at,created_at";

/** GET /api/comments?release=<uuid>&limit=20 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const release = sp.get("release") ?? "";
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit")) || PAGE));
  if (!UUID_RE.test(release)) return NextResponse.json({ items: [], hasMore: false });

  const sb = getServerSupabase();
  if (!sb) return NextResponse.json({ items: [], hasMore: false, disabled: true });

  const { data, error } = await sb
    .from("comments")
    .select(COLS)
    .eq("release_id", release)
    .order("created_at", { ascending: false })
    .limit(limit + 1);
  if (error) {
    // Chưa chạy supabase/add-comments.sql
    return NextResponse.json({ items: [], hasMore: false, disabled: true });
  }
  const rows = (data ?? []) as PublicComment[];
  return NextResponse.json(
    { items: rows.slice(0, limit), hasMore: rows.length > limit },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// Giới hạn tần suất theo IP (bộ nhớ của instance — chặn spam cơ bản, không thay thế captcha)
const hits = new Map<string, number[]>();
function tooFast(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  const lastMinute = list.filter((t) => now - t < 60_000).length;
  if (lastMinute >= 3 || list.length >= 10) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

/** POST /api/comments  { release_id, name, content, website } */
export async function POST(req: Request) {
  const sb = getServerSupabase();
  if (!sb) return NextResponse.json({ error: "Chưa kết nối cơ sở dữ liệu" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  // Ô ẩn "website": người thật không điền, bot thì có → giả vờ thành công
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const release_id = typeof body.release_id === "string" ? body.release_id : "";
  const author_name = cleanText(body.name, NAME_MAX, false) || DEFAULT_NAME;
  const content = cleanText(body.content, COMMENT_MAX, true);

  if (!UUID_RE.test(release_id)) return NextResponse.json({ error: "Không tìm thấy phim" }, { status: 400 });
  if (content.length < COMMENT_MIN) return NextResponse.json({ error: "Bình luận quá ngắn" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooFast(ip)) return NextResponse.json({ error: "Bạn gửi nhanh quá, đợi một chút nhé" }, { status: 429 });

  const { error } = await sb.from("comments").insert({ release_id, author_name, content });
  if (error) {
    console.error("comments insert", error.message);
    return NextResponse.json({ error: "Không gửi được bình luận, thử lại sau nhé" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
