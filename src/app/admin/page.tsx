import type { Metadata } from "next";
import { AdminApp } from "./AdminApp";

export const metadata: Metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
