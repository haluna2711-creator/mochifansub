import type { Metadata } from "next";
import Link from "next/link";
import { MochiFace } from "@/components/MochiLogo";
import { MochiFlavor, flavorTint } from "@/components/MochiFlavor";
import { FLAVORS } from "@/lib/staff";
import { TERMS, TERMS_INTRO, TERMS_NOTE } from "@/lib/terms";

export const metadata: Metadata = {
  title: "Quy định của tiệm",
  robots: { index: false, follow: false },
};

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6 md:pt-14">
      <header className="text-center">
        <MochiFace className="animate-wobble mx-auto h-20 w-20 drop-shadow-md" />
        <h1 className="mt-3 font-display text-3xl font-black md:text-4xl">Quy định của tiệm</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base">{TERMS_INTRO}</p>
      </header>

      <ol className="mt-10 space-y-4">
        {TERMS.map((t, i) => {
          const flavor = FLAVORS[i % FLAVORS.length];
          return (
            <li key={t.title} className="shadow-mochi flex gap-3.5 rounded-[1.75rem] bg-surface p-4 ring-1 ring-line sm:gap-4 sm:p-6">
              <span
                aria-hidden
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl sm:h-14 sm:w-14"
                style={{ background: flavorTint(flavor) }}
              >
                <MochiFlavor flavor={flavor} className="h-9 w-9 sm:h-10 sm:w-10" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-wide text-sakura-deep">Điều {i + 1}</p>
                <h2 className="font-display text-lg font-black leading-snug sm:text-xl">{t.title}</h2>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed [overflow-wrap:anywhere]">{t.body}</p>
                {t.penalty && (
                  <p className="mt-3 rounded-xl bg-sakura-deep/10 px-4 py-2.5 text-sm leading-relaxed">
                    <b className="text-sakura-deep">Hình phạt:</b> {t.penalty}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-8 rounded-2xl bg-sakura/20 px-5 py-4 text-center text-sm font-bold leading-relaxed">{TERMS_NOTE}</p>

      <div className="mt-8 text-center">
        <Link href="/" className="press inline-flex rounded-full bg-sakura-deep px-6 py-3 font-extrabold text-white shadow">
          Về cửa tiệm
        </Link>
      </div>
    </div>
  );
}
