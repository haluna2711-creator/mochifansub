import type { Flavor } from "@/lib/staff";

const PALETTE: Record<Flavor, { a: string; b: string; c: string; line: string; tint: string }> = {
  ichigo: { a: "#ffffff", b: "#ffe6ec", c: "#ffbfcd", line: "#ee8aa3", tint: "#ffe3ea" },
  sakura: { a: "#ffffff", b: "#fde0ea", c: "#f6aec4", line: "#e68aa8", tint: "#fde3ec" },
  yuzu: { a: "#fffbe3", b: "#ffe58f", c: "#ffc54d", line: "#e3a21f", tint: "#fff0c2" },
  taro: { a: "#f8f1ff", b: "#dcc8f5", c: "#b995e6", line: "#9b74d0", tint: "#ece0fb" },
  blue: { a: "#f0fbff", b: "#c6e9fb", c: "#8ecdf2", line: "#5fabdc", tint: "#d9f0fc" },
  matcha: { a: "#f6fce6", b: "#d3eba9", c: "#9fcf6d", line: "#7fb251", tint: "#e3f3c9" },
  choco: { a: "#f3e4d9", b: "#caa086", c: "#9c6c54", line: "#7b503b", tint: "#efd9cb" },
  kinako: { a: "#fffae3", b: "#f8e6a8", c: "#ebc76f", line: "#caa24b", tint: "#fbefc6" },
  plain: { a: "#ffffff", b: "#f7f1ee", c: "#e8dcd8", line: "#cdb9b3", tint: "#f4ecea" },
  gold: { a: "#fff8d6", b: "#ffe58a", c: "#f6c445", line: "#d9a21c", tint: "#fff0b8" },
};

export const flavorTint = (f: Flavor) => PALETTE[f].tint;

/** Phần trang trí trên đỉnh bánh theo từng vị */
function Topping({ flavor }: { flavor: Flavor }) {
  switch (flavor) {
    case "ichigo":
      return (
        <g>
          <path
            d="M32 17.5c-4.8 0-7.6-3.6-7.6-6.6 0-2.5 2.5-3.6 4.5-2.7l3.1 1.2 3.1-1.2c2-.9 4.5.2 4.5 2.7 0 3-2.8 6.6-7.6 6.6Z"
            fill="#ff5d73"
            stroke="#e23b5a"
            strokeWidth="1"
          />
          <path d="M28.6 8l3.4 1.7L35.4 8l-1.1 3.2L32 10l-2.3 1.2Z" fill="#6fbf5a" />
          <g fill="#fff" opacity=".85">
            <circle cx="29.5" cy="13" r=".6" />
            <circle cx="32" cy="14.6" r=".6" />
            <circle cx="34.5" cy="13" r=".6" />
          </g>
        </g>
      );
    case "sakura":
      return (
        <g transform="translate(32 11.5)">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="0" cy="-3.4" rx="2.5" ry="3.3" fill="#ff9fbb" stroke="#ec7da0" strokeWidth=".7" transform={`rotate(${r})`} />
          ))}
          <circle r="1.5" fill="#ffd166" />
        </g>
      );
    case "yuzu":
      return (
        <g>
          <circle cx="32" cy="11.5" r="5.6" fill="#ffe266" stroke="#f0a800" strokeWidth="1.1" />
          <path d="M32 6.6v9.8M27.7 9l8.6 5M36.3 9l-8.6 5" stroke="#f5b800" strokeWidth=".9" strokeLinecap="round" />
        </g>
      );
    case "taro":
      return (
        <g fill="none" stroke="#8a5fc9" strokeWidth="1.7" strokeLinecap="round">
          <path d="M22.5 13.5q9.5-8 19 0" />
          <path d="M26 17q6-4.5 12 0" />
          <circle cx="32" cy="8.2" r="1.3" fill="#fff" stroke="none" />
        </g>
      );
    case "blue":
      return (
        <g>
          <path d="M32 4.6l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9Z" fill="#fff" stroke="#62aedb" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="42" cy="9" r="1.1" fill="#fff" opacity=".9" />
          <circle cx="22" cy="12.5" r=".9" fill="#fff" opacity=".9" />
        </g>
      );
    case "matcha":
      return (
        <g>
          <path d="M31 17c-.3-6 3.5-10.5 10-11 .3 6.3-3.7 10.8-10 11Z" fill="#5fae3f" stroke="#4a9331" strokeWidth=".9" strokeLinejoin="round" />
          <path d="M32.4 15.6c2.6-2.2 4.6-4.7 6.2-7.4" stroke="#bfe8a3" strokeWidth=".8" strokeLinecap="round" fill="none" />
          <g fill="#6fbf4f" opacity=".7">
            <circle cx="22" cy="14" r="1" />
            <circle cx="25.5" cy="9.5" r=".8" />
          </g>
        </g>
      );
    case "choco":
      return (
        <g fill="none" stroke="#523321" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14q3.5 3.4 7 0t7 0 7 0" />
          <path d="M25 9.3q3 2.8 6 0t6 0" />
        </g>
      );
    case "kinako":
      return (
        <g fill="#b9812c" opacity=".8">
          {[
            [24, 12], [28, 8.5], [32, 12.5], [36, 8.5], [40, 12], [30, 16], [34.5, 16.5], [26, 15.5], [38.5, 16],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" />
          ))}
        </g>
      );
    case "gold":
      return (
        <g>
          <path d="M24.5 17l1.6-9 4.2 3.8L32 6.4l1.7 5.4 4.2-3.8 1.6 9Z" fill="#ffd34d" stroke="#e1a800" strokeWidth="1" strokeLinejoin="round" />
          <circle cx="26" cy="7.3" r="1.1" fill="#ff7d96" />
          <circle cx="32" cy="5.7" r="1.1" fill="#ff7d96" />
          <circle cx="38" cy="7.3" r="1.1" fill="#ff7d96" />
        </g>
      );
    default:
      return (
        <g fill="#fff" opacity=".9">
          <circle cx="24" cy="13" r="1" />
          <circle cx="29" cy="9" r=".9" />
          <circle cx="36" cy="10" r="1" />
          <circle cx="40" cy="15" r=".8" />
        </g>
      );
  }
}

/** Bánh mochi nhiều vị, mỗi vị một màu và một lớp trang trí riêng. */
export function MochiFlavor({ flavor, className = "" }: { flavor: Flavor; className?: string }) {
  const p = PALETTE[flavor];
  const id = `mfl-${flavor}`;
  const dark = flavor === "choco";
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor={p.a} />
          <stop offset="60%" stopColor={p.b} />
          <stop offset="100%" stopColor={p.c} />
        </radialGradient>
      </defs>
      <path
        d="M32 4C49 4 61 18 61 33c0 13-12 19-29 19S3 46 3 33C3 18 15 4 32 4Z"
        fill={`url(#${id})`}
        stroke={p.line}
        strokeWidth="2"
      />
      <ellipse cx="21" cy="21" rx="6" ry="3" fill="#fff" opacity={dark ? 0.35 : 0.7} transform="rotate(-25 21 21)" />
      <Topping flavor={flavor} />
      {/* mặt */}
      <circle cx="24" cy="33" r="2.4" fill={dark ? "#2b1d1a" : "#3b2a2e"} />
      <circle cx="40" cy="33" r="2.4" fill={dark ? "#2b1d1a" : "#3b2a2e"} />
      <circle cx="24.8" cy="32.1" r=".8" fill="#fff" />
      <circle cx="40.8" cy="32.1" r=".8" fill="#fff" />
      <path d="M29.2 38q2.8 2.8 5.6 0" stroke={dark ? "#2b1d1a" : "#3b2a2e"} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="17.5" cy="38.5" rx="3.6" ry="2.2" fill="#f48aa6" opacity={dark ? 0.7 : 0.5} />
      <ellipse cx="46.5" cy="38.5" rx="3.6" ry="2.2" fill="#f48aa6" opacity={dark ? 0.7 : 0.5} />
    </svg>
  );
}
