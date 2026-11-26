import Link from "next/link";
import { IconArrow } from "./Icons";

export function Section({
  id,
  title,
  jp,
  href,
  children,
}: {
  id?: string;
  title: string;
  jp?: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-24 md:mt-20">
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
        <div className="flex items-center gap-3">
          <span className="h-9 w-2.5 rounded-full bg-gradient-to-b from-sakura to-sakura-deep" aria-hidden />
          <div>
            <h2 className="font-display text-2xl font-black tracking-tight md:text-[1.75rem]">{title}</h2>
          </div>
        </div>
        {href && (
          <Link
            href={href}
            className="press group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-sm font-bold text-ink ring-1 ring-line hover:bg-sakura/20 hover:text-sakura-deep"
          >
            Xem thêm bánh <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Viên mochi nhỏ đủ màu, đủ kiểu (trơn / rắc hạt / sọc / lá) dùng làm icon thể loại. */
const MOCHI_COLORS = [
  "#F8B4C8", // hồng sakura
  "#A8D08D", // matcha
  "#F9D56E", // yuzu
  "#C9A7E8", // khoai môn
  "#9FD3F0", // xanh trời
  "#F8B98A", // cam đào
  "#FFFFFF", // trắng sữa
  "#B8896B", // cacao
  "#F28B9B", // dâu
  "#9FE0CF", // bạc hà
  "#FFC9B5", // đào
  "#8E8A99", // mè đen
];

function MochiDot({ i }: { i: number }) {
  const color = MOCHI_COLORS[i % MOCHI_COLORS.length];
  const style = i % 4; // 0 trơn · 1 rắc hạt · 2 sọc · 3 lá
  return (
    <svg viewBox="0 0 24 20" className="mr-1.5 inline-block h-4 w-[19px] align-[-3px]" aria-hidden="true">
      <path
        d="M2.5 15.5C2.5 8 6.5 3 12 3s9.5 5 9.5 12.5c0 1.7-1.3 3-3 3h-13c-1.7 0-3-1.3-3-3Z"
        fill={color}
        stroke="rgba(0,0,0,.14)"
        strokeWidth="1"
      />
      {style === 1 && (
        <>
          <circle cx="9" cy="10" r="1" fill="#fff" opacity=".85" />
          <circle cx="14.5" cy="9" r="1" fill="#fff" opacity=".85" />
          <circle cx="12" cy="13.5" r="1" fill="#fff" opacity=".85" />
        </>
      )}
      {style === 2 && <path d="M4 13.5h16v2H4z" fill="#fff" opacity=".45" />}
      {style === 3 && <ellipse cx="12" cy="3.2" rx="2.4" ry="1.3" fill="#6FAF5F" transform="rotate(-20 12 3.2)" />}
      <ellipse cx="8" cy="8" rx="2.6" ry="1.4" fill="#fff" opacity=".55" transform="rotate(-25 8 8)" />
    </svg>
  );
}

export function GenreChips({ genres, active, base = "/browse" }: { genres: string[]; active?: string; base?: string }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link
        href={base}
        className={`press shrink-0 rounded-full px-4 py-2 text-sm font-bold ring-1 ${
          !active ? "bg-ink text-bg ring-ink" : "bg-surface text-ink ring-line hover:bg-surface-2"
        }`}
      >
        Tất cả
      </Link>
      {genres.map((g, i) => (
        <Link
          key={g}
          href={`${base}?genre=${encodeURIComponent(g)}`}
          className={`press shrink-0 rounded-full px-4 py-2 text-sm font-bold ring-1 ${
            active === g ? "bg-sakura-deep text-white ring-sakura-deep" : "bg-surface text-ink ring-line hover:bg-sakura/20"
          }`}
        >
          <MochiDot i={i} />
          {g}
        </Link>
      ))}
    </div>
  );
}
