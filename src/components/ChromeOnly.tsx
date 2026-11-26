"use client";

import { usePathname } from "next/navigation";

/** Ẩn header/footer/thanh điều hướng của site ở trang /gate (trang cổng có giao diện riêng). */
export function ChromeOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/gate" || pathname.startsWith("/gate/")) return null;
  return <>{children}</>;
}
