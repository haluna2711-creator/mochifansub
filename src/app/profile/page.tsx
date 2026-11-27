import type { Metadata } from "next";
import { ProfileEditor } from "./ProfileEditor";

export const metadata: Metadata = { title: "Hồ sơ của tôi", robots: { index: false } };

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-black">Hồ sơ của tôi</h1>
      <p className="mt-1 text-sm text-muted">Tên và ảnh này sẽ hiện ở các bình luận của bạn.</p>
      <ProfileEditor />
    </div>
  );
}
