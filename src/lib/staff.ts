import { normalize } from "./utils";
import type { StaffMember } from "./types";

/** Vai trò gợi ý khi nhập ở admin (dữ liệu lưu vẫn là vai trò gốc) */
export const STAFF_ROLES = ["Dịch", "Biên tập", "Timing", "Typeset", "Kara", "Encode", "QC", "Up"];

/** Các vị bánh mochi dùng làm icon */
export const FLAVORS = [
  "ichigo",
  "sakura",
  "yuzu",
  "taro",
  "blue",
  "matcha",
  "choco",
  "kinako",
  "plain",
  "gold",
] as const;
export type Flavor = (typeof FLAVORS)[number];

type RoleInfo = { title: string; flavor: Flavor };

/**
 * Vai trò gốc → chức danh ở tiệm bánh + vị mochi.
 * Khớp trên chuỗi đã bỏ dấu, nên gõ "Dịch", "dich", "Translator" hay thẳng "Thợ làm nhân" đều nhận.
 */
const ROLES: [RegExp, RoleInfo][] = [
  [/dich|trans|lam nhan/, { title: "Thợ làm nhân", flavor: "ichigo" }], //   dịch = phần nhân của bánh
  [/bien tap|edit|nhao bot/, { title: "Thợ nhào bột", flavor: "sakura" }], //  biên tập = nhào cho mịn
  [/timing|time|canh lua/, { title: "Thợ canh lửa", flavor: "yuzu" }], //    timing = canh giờ hấp
  [/typeset|type|trang tri/, { title: "Thợ trang trí", flavor: "taro" }], //  typeset = trang trí bánh
  [/kara|hat ru/, { title: "Thợ hát ru bánh", flavor: "blue" }], //          kara = hiệu ứng hát
  [/encode|enc|hap banh/, { title: "Thợ hấp bánh", flavor: "matcha" }], //    encode = hấp thành phẩm
  [/qc|kiem|check|nem thu/, { title: "Thợ nếm thử", flavor: "choco" }], //    QC = nếm kiểm tra
  [/^up|dang|giao banh/, { title: "Người giao bánh", flavor: "kinako" }], //  up = giao bánh tới khách
  [/raw|xay bot/, { title: "Thợ xay bột", flavor: "plain" }], //             raw = nguyên liệu thô
  [/quan ly|leader|truong|manager|chu tiem/, { title: "Chủ tiệm", flavor: "gold" }],
];

export function roleInfo(role: string): RoleInfo & { hint: string | null } {
  const n = normalize(role.trim());
  const hit = ROLES.find(([re]) => re.test(n))?.[1];
  if (hit) return { ...hit, hint: normalize(hit.title) === n ? null : role.trim() };
  // Vai trò tự đặt: giữ nguyên tên, chọn vị theo tên để mỗi vai trò một màu ổn định
  let h = 0;
  for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { title: role.trim() || "Nhân viên tiệm", flavor: FLAVORS[h % FLAVORS.length], hint: null };
}

/** Gộp những người cùng chức danh, giữ thứ tự xuất hiện đầu tiên. */
export function groupStaff(staff: StaffMember[] | null | undefined) {
  if (!Array.isArray(staff)) return [];
  const map = new Map<string, { title: string; flavor: Flavor; hint: string | null; names: string[] }>();
  for (const m of staff) {
    const name = typeof m?.name === "string" ? m.name.trim() : "";
    if (!name) continue;
    const role = typeof m.role === "string" ? m.role : "";
    const info = roleInfo(role || "Khác");
    const g = map.get(info.title) ?? { ...info, names: [] };
    if (!g.names.some((x) => normalize(x) === normalize(name))) g.names.push(name);
    map.set(info.title, g);
  }
  return [...map.values()];
}
