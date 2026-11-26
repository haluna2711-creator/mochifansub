import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mochi-fansub.vercel.app";
  const slugs = await getAllSlugs();
  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/browse`, changeFrequency: "daily", priority: 0.8 },
    ...slugs.map((s) => ({ url: `${base}/${s.slug}`, lastModified: s.updated_at, priority: 0.7 })),
  ];
}
