import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { themeScript } from "@/components/ThemeToggle";
import { SearchPalette } from "@/components/SearchPalette";
import { SiteBackground } from "@/components/SiteBackground";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mochi-fansub.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Tiệm bánh Mochi — Dẻo thơm một hạt, đắng cay muôn phần.", template: "%s · Tiệm bánh Mochi" },
  description: "Tiệm bánh Mochi",
  applicationName: "Tiệm bánh Mochi",
  openGraph: { type: "website", siteName: "Tiệm bánh Mochi", locale: "vi_VN" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8f1" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1517" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800;900&family=Nunito:wght@400;600;700;800;900&family=Zen+Maru+Gothic:wght@500;700;900&display=swap"
        />
      </head>
      <body className="mochi-bg min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
          Bỏ qua tới nội dung
        </a>
        <SiteBackground />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileNav />
        <SearchPalette />
      </body>
    </html>
  );
}
