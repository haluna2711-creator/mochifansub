import { NextResponse } from "next/server";
import { getServerSupabase, getUserSupabase } from "@/lib/supabase";
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

  type Row = PublicComment & { user_id?: string | null };
  const query = (cols: string) =>
    sb
      .from("comments")
      .select(cols)
      .eq("release_id", release)
      .order("created_at", { ascending: false })
      .limit(limit + 1);

  // Thử lấy cả user_id; nếu chưa chạy supabase/add-profiles.sql thì lấy như cũ
  let res = await query(`${COLS},user_id`);
  if (res.error) res = await query(COLS);
  if (res.error) {
    // Chưa chạy supabase/add-comments.sql
    return NextResponse.json({ items: [], hasMore: false, disabled: true });
  }
  const rows = (res.data ?? []) as unknown as Row[];
  const page = rows.slice(0, limit);

  // Tên + ảnh hiện tại của người bình luận (đổi tên/ảnh thì bình luận cũ cũng đổi theo)
  const ids = [...new Set(page.map((r) => r.user_id).filter((v): v is string => Boolean(v)))];
  const profiles = new Map<string, { username: string | null; avatar_url: string | null }>();
  if (ids.length) {
    const { data: ps } = await sb.from("public_profiles").select("id,username,avatar_url").in("id", ids);
    for (const p of ps ?? []) profiles.set(p.id, p);
  }
  const items: PublicComment[] = page.map(({ user_id, ...r }) => {
    const p = user_id ? profiles.get(user_id) : undefined;
    return { ...r, author_name: p?.username || r.author_name, avatar_url: p?.avatar_url ?? null };
  });
  return NextResponse.json({ items, hasMore: rows.length > limit }, { headers: { "Cache-Control": "no-store" } });
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

  // Thành viên đăng nhập: gửi qua hàm post_comment bằng phiên của họ → DB tự gắn user_id và tên hồ sơ
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userSb = token ? getUserSupabase(token) : null;

  let error: { code?: string; message: string } | null = null;
  if (userSb) {
    const r = await userSb.rpc("post_comment", { p_release: release_id, p_name: author_name, p_content: content });
    error = r.error;
    if (r.status === 401) {
      return NextResponse.json({ error: "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại" }, { status: 401 });
    }
    // Chưa chạy supabase/add-profiles.sql → quay về cách gửi cũ
    if (error?.code === "PGRST202") error = (await sb.from("comments").insert({ release_id, author_name, content })).error;
  } else {
    error = (await sb.from("comments").insert({ release_id, author_name, content })).error;
  }
  if (error) {
    console.error("comments insert", error.message);
    return NextResponse.json({ error: "Không gửi được bình luận, thử lại sau nhé" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
