import { backgroundStyle, getBackground } from "@/lib/siteSettings";

/** Lớp ảnh nền cố định phía sau toàn bộ trang. Không render gì nếu chưa đặt ảnh. */
export async function SiteBackground() {
  const bg = await getBackground();
  if (!bg.url) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={backgroundStyle(bg)}
    />
  );
}
