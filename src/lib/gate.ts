/** Tên cookie "đã đăng nhập": proxy.ts dùng nó để quyết định cho vào hay đưa về /gate. */
export const GATE_COOKIE = "mochi-in";

/** Đặt NEXT_PUBLIC_GATE_DISABLED=1 trên Vercel (rồi Redeploy) để tắt cổng khi cần. */
export const GATE_DISABLED = process.env.NEXT_PUBLIC_GATE_DISABLED === "1";

export function setGateCookie() {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${GATE_COOKIE}=1; Path=/; SameSite=Lax${secure}`;
}

export function clearGateCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${GATE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** Chỉ cho quay lại đường dẫn nội bộ (chặn open-redirect sang trang khác). */
export function safeNext(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  if (/^\/(gate|admin)(\/|\?|$)/.test(raw)) return "/";
  return raw;
}
