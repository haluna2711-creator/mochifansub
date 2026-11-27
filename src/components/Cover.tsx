import Image from "next/image";
import { hueFrom } from "@/lib/utils";
import { MochiFace } from "./MochiLogo";

interface Props {
  src: string | null;
  title: string;
  titleJp?: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
  variant?: "poster" | "banner";
  /** Hiện tên phim trên bìa giữ chỗ (tắt khi tên đã hiển thị bên dưới thẻ). */
  showTitle?: boolean;
  /** Chất lượng nén khi Next tối ưu ảnh (mặc định 90, cần có trong images.qualities). */
  quality?: 75 | 90;
  /** Vùng ảnh được giữ khi bị cắt, dạng object-position (vd "50% 20%" = giữ phần trên nhiều hơn). */
  position?: string;
}

/** Ảnh bìa phim; nếu chưa có ảnh sẽ hiện bìa pastel kiểu mochi tự sinh. */
export function Cover({ src, title, titleJp, sizes, priority, className = "", variant = "poster", showTitle = true, quality = 90, position }: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt={title}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        style={position ? { objectPosition: position } : undefined}
        className={`object-cover ${className}`}
      />
    );
  }

  const h = hueFrom(title);
  const h2 = (h + 40) % 360;
  return (
    <div
      role="img"
      aria-label={title}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(155deg, hsl(${h} 85% 90%) 0%, hsl(${h2} 70% 80%) 55%, hsl(${h} 55% 68%) 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.9) 1.2px, transparent 1.4px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60 blur-2xl"
        style={{ background: `hsl(${(h + 180) % 360} 80% 88%)` }}
      />
      {variant === "poster" ? (
        <>
          {titleJp && (
            <span
              className="absolute right-3 top-3 font-jp text-xl font-bold text-white/90 drop-shadow [writing-mode:vertical-rl]"
              style={{ textShadow: `0 2px 8px hsl(${h} 50% 40% / .4)` }}
            >
              {titleJp}
            </span>
          )}
          <MochiFace className="absolute bottom-[22%] left-1/2 w-[46%] -translate-x-1/2 drop-shadow-lg" />
          {showTitle && <span className="absolute inset-x-3 bottom-3 line-clamp-2 font-display text-sm font-extrabold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.25)]">
            {title}
          </span>}
        </>
      ) : (
        titleJp && (
          <span className="absolute right-[6%] top-1/2 -translate-y-1/2 select-none font-jp text-[18vw] font-black leading-none text-white/25 md:text-[9rem]">
            {titleJp.slice(0, 4)}
          </span>
        )
      )}
    </div>
  );
}
