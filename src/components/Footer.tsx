import Link from "next/link";
import { MochiFace } from "./MochiLogo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-bg-2/60 pb-28 md:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <MochiFace className="animate-wobble h-14 w-14" />
          <div>
            <p className="font-display text-lg font-extrabold">Tiệm bánh Mochi</p>
            <p className="text-sm text-muted">Dẻo thơm một hạt, đắng cay muôn phần.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">
          <Link href="/browse" className="hover:text-sakura-deep">Tủ bánh</Link>
          <Link href="/quy-dinh" className="hover:text-sakura-deep">Quy định</Link>
          <Link href="/gate" className="hover:text-sakura-deep">Tài khoản</Link>
        </div>
      </div>
      <p className="mx-auto max-w-7xl px-4 text-xs text-muted sm:px-6">
        © {new Date().getFullYear()} Tiệm bánh Mochi · Sản phẩm phi lợi nhuận của tiệm bánh. Hãy ủng hộ hàng chính hãng khi có thể. Xin cảm ơn.
      </p>
    </footer>
  );
}
