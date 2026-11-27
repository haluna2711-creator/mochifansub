import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";

// Luôn chạy thật, không cache — để mỗi lần gọi đều thật sự chạm vào database
export const dynamic = "force-dynamic";

/**
 * Giữ Supabase "thức": Vercel Cron gọi route này mỗi ngày (xem vercel.json),
 * route chạy một truy vấn rất nhẹ để Supabase ghi nhận có hoạt động
 * (gói free sẽ tự tạm dừng project sau 7 ngày không có hoạt động).
 *
 * Bảo vệ (tùy chọn): đặt biến CRON_SECRET trên Vercel, Vercel Cron sẽ tự gửi kèm
 * header "Authorization: Bearer <CRON_SECRET>" và route sẽ từ chối các lời gọi khác.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sb = getServerSupabase();
  if (!sb) {
    return NextResponse.json({ ok: true, skipped: "Supabase chưa được cấu hình" });
  }

  const { error, count } = await sb.from("releases").select("id", { count: "exact", head: true });
  if (error) {
    console.error("keepalive lỗi:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, releases: count ?? 0, at: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
