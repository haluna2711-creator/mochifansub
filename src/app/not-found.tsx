import Link from "next/link";
import { MochiFace } from "@/components/MochiLogo";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <MochiFace className="animate-wobble h-28 w-28" />
      <h1 className="mt-6 font-display text-4xl font-black">404</h1>
      <p className="mt-2 text-muted">Ối, chiếc bánh mochi này đã bị ai đó ăn mất rồi…</p>
      <Link href="/" className="press mt-8 rounded-full bg-sakura-deep px-6 py-3 font-extrabold text-white shadow-lg">
        Về trang chủ
      </Link>
    </div>
  );
}
