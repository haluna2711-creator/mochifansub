"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Release } from "@/lib/types";
import { STATUS_LABEL, normalize, timeAgo } from "@/lib/utils";
import { MochiFace, MochiLogo } from "@/components/MochiLogo";
import { Cover } from "@/components/Cover";
import { IconEdit, IconPlus, IconSearch } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button, Field, Spinner, inputCls } from "./ui";
import { ReleaseEditor } from "./ReleaseEditor";

type AdminState = "loading" | "anon" | "not-admin" | "admin";

export function AdminApp() {
  const sb = getBrowserSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<AdminState>("loading");

  useEffect(() => {
    if (!sb) return;
    const check = async (s: Session | null) => {
      setSession(s);
      if (!s) return setState("anon");
      const { data } = await sb.from("admins").select("user_id").eq("user_id", s.user.id).maybeSingle();
      setState(data ? "admin" : "not-admin");
    };
    sb.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => check(s));
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  if (!isSupabaseConfigured || !sb) {
    return (
      <Shell>
        <Card>
          <MochiFace className="mx-auto h-16 w-16" />
          <h1 className="mt-4 text-center font-display text-xl font-black">Chưa kết nối Supabase</h1>
          <p className="mt-2 text-center text-sm text-muted">
            Thêm <code className="rounded bg-surface-2 px-1">NEXT_PUBLIC_SUPABASE_URL</code> và{" "}
            <code className="rounded bg-surface-2 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> vào Vercel → Settings →
            Environment Variables rồi deploy lại.
          </p>
        </Card>
      </Shell>
    );
  }

  if (state === "loading")
    return (
      <Shell>
        <div className="grid place-items-center py-32 text-sakura-deep">
          <Spinner className="h-8 w-8" />
        </div>
      </Shell>
    );

  if (state === "anon") return <Shell><Login sb={sb} /></Shell>;

  if (state === "not-admin")
    return (
      <Shell>
        <Card>
          <h1 className="font-display text-xl font-black">Tài khoản chưa có quyền admin</h1>
          <p className="mt-2 text-sm text-muted">Chạy lệnh sau trong Supabase → SQL Editor rồi tải lại trang:</p>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-surface-2 p-4 text-xs ring-1 ring-line">
{`insert into public.admins (user_id)
values ('${session?.user.id}');`}
          </pre>
          <Button variant="ghost" className="mt-4" onClick={() => sb.auth.signOut()}>
            Đăng xuất
          </Button>
        </Card>
      </Shell>
    );

  return <Dashboard sb={sb} email={session?.user.email ?? ""} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Link href="/" className="group mx-auto mb-8 flex w-fit">
        <MochiLogo />
      </Link>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="shadow-mochi rounded-[2rem] bg-surface p-6 ring-1 ring-line sm:p-8">{children}</div>;
}

function Login({ sb }: { sb: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <h1 className="font-display text-2xl font-black">Đăng nhập quản trị</h1>
      <p className="mt-1 text-sm text-muted">Chỉ dành cho thành viên nhóm dịch.</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          const { error } = await sb.auth.signInWithPassword({ email, password });
          if (error) setErr(error.message === "Invalid login credentials" ? "Sai email hoặc mật khẩu" : error.message);
          setBusy(false);
        }}
      >
        <Field label="Email">
          <input className={inputCls} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Mật khẩu">
          <input className={inputCls} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {err && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-300">{err}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Spinner />} Đăng nhập
        </Button>
      </form>
    </Card>
  );
}

function Dashboard({ sb, email }: { sb: SupabaseClient; email: string }) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Release | "new" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await sb.from("releases").select("*").order("updated_at", { ascending: false }).limit(1000);
    setReleases((data ?? []) as Release[]);
    setLoading(false);
  }, [sb]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return nq ? releases.filter((r) => normalize(`${r.title} ${r.title_jp ?? ""} ${r.slug}`).includes(nq)) : releases;
  }, [releases, q]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="group">
            <MochiLogo />
          </Link>
          <span className="rounded-full bg-matcha/20 px-2.5 py-0.5 text-xs font-extrabold text-matcha-deep">Admin</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted sm:inline">{email}</span>
            <ThemeToggle />
            <Button variant="ghost" className="h-10 px-4" onClick={() => sb.auth.signOut()}>
              Thoát
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-black">Kho phim</h1>
            <p className="text-sm text-muted">{releases.length} bộ · thay đổi hiển thị trên trang chủ sau tối đa 60 giây</p>
          </div>
          <Button onClick={() => setEditing("new")}>
            <IconPlus /> Thêm phim
          </Button>
        </div>

        <label className="mt-6 flex h-12 items-center gap-3 rounded-full bg-surface px-5 ring-1 ring-line focus-within:ring-2 focus-within:ring-sakura">
          <IconSearch className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lọc theo tên…" className="w-full bg-transparent text-sm outline-none" />
        </label>

        {loading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-3xl" />
            ))}
          </div>
        ) : filtered.length ? (
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {filtered.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setEditing(r)}
                  className="squish flex w-full items-center gap-4 rounded-3xl bg-surface p-3 text-left ring-1 ring-line hover:ring-sakura"
                >
                  <span className="relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-xl">
                    <Cover src={r.cover_url} title={r.title} sizes="48px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">
                      {r.featured && <span className="mr-1 text-yuzu">★</span>}
                      {r.title}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {STATUS_LABEL[r.status]} · /{r.slug} · {timeAgo(r.updated_at)}
                    </span>
                  </span>
                  <IconEdit className="mr-2 h-4 w-4 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col items-center text-center">
            <MochiFace className="animate-wobble h-16 w-16" />
            <p className="mt-3 font-bold">Chưa có phim nào</p>
            <p className="text-sm text-muted">Bấm “Thêm phim” để bắt đầu.</p>
          </div>
        )}
      </div>

      {editing && (
        <ReleaseEditor
          sb={sb}
          release={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(r) => {
            load();
            if (r) setEditing(r);
          }}
          onDeleted={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
