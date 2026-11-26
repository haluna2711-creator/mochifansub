import type { StaffMember } from "@/lib/types";
import { groupStaff, roleEmoji } from "@/lib/staff";

/** Nhân sự tham gia dự án — hiển thị trước phần Link tải. */
export function StaffList({ staff }: { staff: StaffMember[] | null | undefined }) {
  const groups = groupStaff(staff);
  if (!groups.length) return null;

  return (
    <section aria-labelledby="staff-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-8 w-2.5 rounded-full bg-gradient-to-b from-sakura to-sakura-deep" aria-hidden />
        <h2 id="staff-title" className="font-display text-xl font-black md:text-2xl">Nhân sự tham gia</h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map(({ role, names }) => (
          <li
            key={role}
            className="flex items-center gap-3 rounded-2xl bg-surface p-3.5 ring-1 ring-line transition-colors hover:bg-sakura/10"
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sakura/20 text-xl"
              aria-hidden
            >
              {roleEmoji(role)}
            </span>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-wide text-muted">{role}</p>
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
