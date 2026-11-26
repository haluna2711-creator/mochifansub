import { normalize } from "./utils";
import type { StaffMember } from "./types";

/** Vai trò gợi ý khi nhập ở admin */
export const STAFF_ROLES = ["Dịch", "Biên tập", "Timing", "Typeset", "Kara", "Encode", "QC", "Up"];

const EMOJI: [RegExp, string][] = [
  [/dich|trans/, "💬"],
  [/bien tap|edit/, "✏️"],
  [/timing|time/, "⏱️"],
  [/typeset|type/, "🎨"],
  [/kara/, "🎤"],
  [/encode|enc/, "🎞️"],
  [/qc|kiem|check/, "🔍"],
  [/quan ly|leader|truong|manager/, "⭐"],
  [/^up|dang/, "📤"],
  [/raw/, "📼"],
];

export function roleEmoji(role: string) {
  const n = normalize(role);
  return EMOJI.find(([re]) => re.test(n))?.[1] ?? "🍡";
}

/** Gộp những người cùng vai trò, giữ thứ tự xuất hiện đầu tiên. */
export function groupStaff(staff: StaffMember[] | null | undefined) {
  const map = new Map<string, string[]>();
  if (!Array.isArray(staff)) return [];
  for (const m of staff) {
    const name = typeof m?.name === "string" ? m.name.trim() : "";
    if (!name) continue;
    const role = (typeof m.role === "string" && m.role.trim()) || "Khác";
    map.set(role, [...(map.get(role) ?? []), name]);
  }
  return [...map.entries()].map(([role, names]) => ({ role, names }));
}
