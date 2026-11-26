import Link from "next/link";
import { MochiFace } from "./MochiLogo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-bg-2/60 pb-28 md:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <MochiFace className="animate-wobble h-14 w-14" />
          <div>
            <p className="font-display text-lg font-extrabold">Mochi Fansub</p>
            <p className="text-sm text-muted">Mềm, dẻo, ngọt — như bánh mochi vừa ra lò.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">
          <Link href="/browse" className="hover:text-sakura-deep">Khám phá</Link>
          <Link href="/browse?status=ongoing" className="hover:text-sakura-deep">Đang tiến hành</Link>
          <Link href="/browse?status=completed" className="hover:text-sakura-deep">Hoàn thành</Link>
          <Link href="/admin" className="hover:text-sakura-deep">Quản trị</Link>
        </div>
      </div>
      <p className="mx-auto max-w-7xl px-4 text-xs text-muted sm:px-6">
        © {new Date().getFullYear()} Mochi Fansub · Sản phẩm phi lợi nhuận của nhóm dịch. Hãy ủng hộ bản quyền chính thức khi có thể. <span className="font-jp">ありがとう！</span>
      </p>
    </footer>
  );
}
