import type { Metadata } from "next";
import { Gate } from "@/components/Gate";
import { getBackground } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "Cổng tiệm bánh",
  robots: { index: false, follow: false },
};

export default async function GatePage() {
  const bg = await getBackground();
  return <Gate bgUrl={bg.url || "/assets/default-bg.png"} />;
}
