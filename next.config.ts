import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 chỉ cho phép quality nằm trong danh sách này
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**" },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
