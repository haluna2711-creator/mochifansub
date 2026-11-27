import type { Metadata } from "next";
import { Gate } from "@/components/Gate";
import { GATE_DEFAULT_IMAGE, getGateBackground } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "Cổng tiệm bánh",
  robots: { index: false, follow: false },
};

export default async function GatePage() {
  const bg = await getGateBackground();
  return <Gate bgUrl={bg.url || GATE_DEFAULT_IMAGE} overlay={bg.overlay} />;
}
