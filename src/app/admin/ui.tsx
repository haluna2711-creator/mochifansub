"use client";

export const inputCls =
  "w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink ring-1 ring-line outline-none transition placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-sakura";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "matcha" }) {
  const v = {
    primary: "bg-sakura-deep text-white hover:brightness-110 shadow-[0_8px_20px_-10px] shadow-sakura-deep",
    matcha: "bg-matcha text-white hover:brightness-105",
    ghost: "bg-surface text-ink ring-1 ring-line hover:bg-surface-2",
    danger: "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-300",
  }[variant];
  return (
    <button
      {...props}
      className={`press inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-extrabold disabled:pointer-events-none disabled:opacity-50 ${v} ${className}`}
    />
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
      aria-hidden
    />
  );
}
