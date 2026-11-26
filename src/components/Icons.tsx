type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const IconSearch = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconHome = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-5h4v5" /></svg>
);
export const IconGrid = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><rect x="4" y="4" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="2" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" /></svg>
);
export const IconSun = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const IconMoon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
);
export const IconMagnet = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M6 3v8a6 6 0 0 0 12 0V3" /><path d="M6 7h4M14 7h4" /><path d="M10 3v8a2 2 0 0 0 4 0V3" /></svg>
);
export const IconDownload = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></svg>
);
export const IconCopy = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><rect x="8" y="8" width="12" height="12" rx="3" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
);
export const IconCheck = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IconArrow = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconChevron = ({ className = "h-5 w-5", dir = "right" }: P & { dir?: "left" | "right" }) => (
  <svg {...base} className={className}>{dir === "right" ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}</svg>
);
export const IconPlus = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconTrash = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
);
export const IconEdit = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>
);
export const IconX = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconSparkle = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" /></svg>
);
