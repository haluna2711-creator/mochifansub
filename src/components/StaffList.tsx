import type { StaffMember } from "@/lib/types";
import { groupStaff } from "@/lib/staff";
import { MochiFlavor, flavorTint } from "./MochiFlavor";

/** Nhân viên tiệm bánh (nhân sự dự án) — hiển thị trước phần mua bánh. */
export function StaffList({ staff }: { staff: StaffMember[] | null | undefined }) {
  const groups = groupStaff(staff);
  if (!groups.length) return null;

  return (
    <section aria-labelledby="staff-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-8 w-2.5 rounded-full bg-gradient-to-b from-sakura to-sakura-deep" aria-hidden />
        <h2 id="staff-title" className="font-display text-xl font-black md:text-2xl">Nhân viên tiệm bánh</h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map(({ title, flavor, names }) => (
          <li
            key={title}
            className="group flex items-center gap-3 rounded-2xl bg-surface p-3.5 ring-1 ring-line transition-colors hover:bg-sakura/10"
          >
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{ background: flavorTint(flavor) }}
              aria-hidden
            >
              <MochiFlavor
                flavor={flavor}
                className="h-9 w-9 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110"
              />
            </span>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-wide text-muted">
                {title}
              </p>
              <p className="font-display font-bold leading-snug text-ink [overflow-wrap:anywhere]">
                {names.join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
