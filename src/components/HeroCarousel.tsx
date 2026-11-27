"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Release } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/utils";
import { Cover } from "./Cover";
import { IconArrow, IconChevron, IconSparkle } from "./Icons";

export function HeroCarousel({ items }: { items: Release[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  const go = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const n = items.length;
    const next = ((i % n) + n) % n;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }, [items.length]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIndex(Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => {
      if (!paused.current && document.visibilityState === "visible") go(index + 1);
    }, 6500);
    return () => clearInterval(t);
  }, [index, go, items.length]);

  if (!items.length) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Phim nổi bật"
      className="relative"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
      onTouchEnd={() => setTimeout(() => (paused.current = false), 4000)}
    >
      <div
        ref={track}
        className="snap-row auto-cols-[100%] rounded-[2rem] md:rounded-[2.5rem]"
      >
        {items.map((r, i) => (
          <article
            key={r.id}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${items.length}`}
            className="shadow-mochi relative isolate min-h-[25rem] overflow-hidden rounded-[2rem] ring-1 ring-line md:min-h-[27rem] md:rounded-[2.5rem]"
          >
            {/* nền */}
            <div className="absolute inset-0 -z-10">
              <Cover
                src={r.banner_url ?? r.cover_url}
                title={r.title}
                titleJp={r.title_jp}
                variant="banner"
                priority={i === 0}
                sizes="(max-width: 1280px) 100vw, 1280px"
                className={!r.banner_url && r.cover_url ? "scale-110 blur-2xl" : ""}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent md:bg-gradient-to-r md:from-black/70 md:via-black/30" />
            </div>

            <div className="flex h-full min-h-[25rem] items-end gap-8 p-6 pb-14 sm:p-8 sm:pb-14 md:min-h-[27rem] md:items-center md:p-12">
              <div className="max-w-xl text-white">
                <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold backdrop-blur-md">
                  <IconSparkle className="h-3.5 w-3.5 text-yuzu" /> Nổi bật · {STATUS_LABEL[r.status]}
                </p>
                {r.title_jp && <p className="font-jp text-sm font-bold tracking-widest text-white/80">{r.title_jp}</p>}
                <h2 className="mt-1 font-display text-3xl font-black leading-tight drop-shadow-md sm:text-4xl md:text-5xl">
                  {r.title}
                </h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.genres.slice(0, 3).map((g) => (
                    <span key={g} className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm">
                      {g}
                    </span>
                  ))}
                </div>
                {r.synopsis && (
                  <p className="mt-4 line-clamp-2 max-w-lg text-sm leading-relaxed text-white/85 md:line-clamp-3 md:text-base">
                    {r.synopsis}
                  </p>
                )}
                <Link
                  href={`/${r.slug}`}
                  className="press mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-[#3b2a2e] shadow-lg hover:bg-sakura hover:text-white"
                >
                  Mua ngay <IconArrow />
                </Link>
              </div>

              <Link
                href={`/${r.slug}`}
                tabIndex={-1}
                className="squish relative ml-auto hidden aspect-[2/3] w-52 shrink-0 overflow-hidden rounded-[1.75rem] shadow-2xl ring-4 ring-white/40 md:block lg:w-60"
              >
                <Cover src={r.cover_url} title={r.title} titleJp={r.title_jp} sizes="480px" priority={i === 0} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 md:bottom-6">
            {items.map((r, i) => (
              <button
                key={r.id}
                type="button"
                aria-label={`Tới slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-2.5 rounded-full transition-all duration-500 [transition-timing-function:var(--ease-mochi)] ${
                  i === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
          <div className="absolute bottom-5 right-6 hidden gap-2 md:flex">
            <button type="button" aria-label="Trước" onClick={() => go(index - 1)} className="press grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/35">
              <IconChevron dir="left" />
            </button>
            <button type="button" aria-label="Sau" onClick={() => go(index + 1)} className="press grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/35">
              <IconChevron />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
