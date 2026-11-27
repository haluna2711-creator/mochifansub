import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE } from "@/lib/gate";

/**
 * Cổng vào tiệm: chưa đăng nhập thì mọi trang đều đưa về /gate.
 * Phiên đăng nhập của Supabase nằm ở trình duyệt nên ở đây chỉ kiểm tra cookie "mochi-in";
 * việc xác thực thật do <AuthGuard /> làm ở phía trình duyệt, còn dữ liệu được bảo vệ bởi RLS.
 */
export function proxy(req: NextRequest) {
  // Chưa cấu hình Supabase (chế độ demo) hoặc đã tắt cổng → cho vào tự do
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_GATE_DISABLED === "1") {
    return NextResponse.next();
  }
  if (req.cookies.get(GATE_COOKIE)?.value === "1") return NextResponse.next();

  const url = req.nextUrl.clone();
  const wanted = req.nextUrl.pathname + req.nextUrl.search;
  url.pathname = "/gate";
  url.search = "";
  if (wanted !== "/") url.searchParams.set("next", wanted);
  return NextResponse.redirect(url);
}

export const config = {
  // Bỏ qua: /gate, /quy-dinh (công khai), /admin (có đăng nhập riêng), /api, file tĩnh (có dấu chấm), _next
  matcher: ["/((?!gate|admin|quy-dinh|api|_next|.*\\..*).*)"],
};
