"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase";
import { clearGateCookie, safeNext, setGateCookie } from "@/lib/gate";
import { MochiFace } from "./MochiLogo";

type View = "signup" | "login" | "forgot" | "reset" | "member";
type Msg = { text: string; ok: boolean };
type Quota = { remaining: number; limit: number } | "error" | null;

const input =
  "w-full rounded-xl bg-bg px-4 py-2.5 text-base text-ink ring-1 ring-line outline-none transition placeholder:text-muted focus:ring-2 focus:ring-sakura-deep";
const label = "mb-1 mt-4 block text-sm font-extrabold";
const btn =
  "press mt-5 w-full rounded-full bg-sakura-deep py-3 font-extrabold text-white shadow disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "press mt-3 w-full rounded-full bg-surface-2 py-3 font-extrabold text-ink ring-1 ring-line";
const linkCls = "font-bold text-sakura-deep underline underline-offset-2";

const SIGNUP_ERRORS: Record<string, string> = {
  full: "Hôm nay tiệm đã đủ khách. Vui lòng ghé tiệm bánh vào ngày mai.",
  blocked: "Email này đã bị khóa, không thể đăng ký lại.",
  taken: "Tên này đã có người dùng. Hãy chọn tên khác.",
  exists: "Email này đã có tài khoản. Hãy đăng nhập.",
};

export function Gate({ bgUrl }: { bgUrl: string }) {
  const router = useRouter();
  const sb = getBrowserSupabase();

  const [view, setView] = useState<View | null>(null);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [busy, setBusy] = useState(false);
  const [quota, setQuota] = useState<Quota>(null);
  const [agree, setAgree] = useState(false);
  const [username, setUsername] = useState("");
  const dlg = useRef<HTMLDialogElement>(null);
  const alive = useRef(true);
  const recovering = useRef(false);
  const nextPath = useRef("/");

  const goTo = (v: View) => {
    setMsg(null);
    setView(v);
  };

  /** Cập nhật giao diện theo phiên đăng nhập hiện tại */
  const refresh = useCallback(
    async (session: Session | null) => {
      if (!sb || !alive.current) return;
      if (recovering.current) return setView("reset");
      if (!session) {
        clearGateCookie();
        return setView((v) => (v === null || v === "member" ? "signup" : v));
      }
      setGateCookie();
      const { data } = await sb.from("profiles").select("username").eq("id", session.user.id).maybeSingle();
      if (!alive.current) return;
      setUsername(data?.username || (session.user.user_metadata?.username as string | undefined) || "bạn");
      setView("member");
    },
    [sb],
  );

  useEffect(() => {
    alive.current = true;
    nextPath.current = safeNext(new URLSearchParams(location.search).get("next"));
    recovering.current = /type=recovery/.test(location.hash);
    if (!sb) {
      setView("signup");
      return () => {
        alive.current = false;
      };
    }
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        recovering.current = true;
        setView("reset");
        return;
      }
      // Không gọi Supabase ngay trong callback (dễ bị treo) → hoãn sang lượt sau
      setTimeout(() => refresh(session), 0);
    });
    return () => {
      alive.current = false;
      sub.subscription.unsubscribe();
    };
  }, [sb, refresh]);

  const loadQuota = useCallback(async () => {
    if (!sb) return;
    const { data, error } = await sb.rpc("signup_status");
    if (error || !data) return setQuota("error");
    setQuota({ remaining: Number(data.remaining), limit: Number(data.limit) });
  }, [sb]);

  useEffect(() => {
    if (view === "signup") loadQuota();
  }, [view, loadQuota]);

  const enter = () => {
    setGateCookie();
    router.replace(nextPath.current);
  };

  /* ---------- Hành động ---------- */

  const onSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sb || busy) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const name = String(fd.get("username") ?? "").trim().replace(/\s+/g, " ");
    const password = String(fd.get("password") ?? "");
    setBusy(true);
    setMsg(null);

    const { data: st } = await sb.rpc("check_signup", { p_email: email, p_username: name });
    if (typeof st === "string" && st !== "ok") {
      setBusy(false);
      setMsg({ text: SIGNUP_ERRORS[st] ?? "Không thể đăng ký lúc này.", ok: false });
      loadQuota();
      return;
    }

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { username: name }, emailRedirectTo: `${location.origin}/gate` },
    });
    setBusy(false);
    if (error) {
      setMsg({ text: `Đăng ký chưa được: ${error.message}`, ok: false });
      loadQuota();
      return;
    }
    if (data.session) return enter();
    setMsg({ text: "Đã tạo tài khoản! Hãy kiểm tra email để xác nhận, rồi đăng nhập.", ok: true });
    form.reset();
    setAgree(false);
    loadQuota();
  };

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sb || busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setMsg(null);
    const { error } = await sb.auth.signInWithPassword({
      email: String(fd.get("email") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
    });
    setBusy(false);
    if (error) {
      const text = /not confirmed/i.test(error.message)
        ? "Email chưa được xác nhận. Hãy mở email và bấm vào liên kết trong thư."
        : "Email hoặc mật khẩu chưa đúng, hoặc tài khoản đã bị khóa.";
      return setMsg({ text, ok: false });
    }
    enter();
  };

  const onForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sb || busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setMsg(null);
    const { error } = await sb.auth.resetPasswordForEmail(String(fd.get("email") ?? "").trim(), {
      redirectTo: `${location.origin}/gate`,
    });
    setBusy(false);
    setMsg(
      error
        ? { text: `Chưa gửi được: ${error.message}`, ok: false }
        : { text: "Đã gửi liên kết. Hãy kiểm tra email.", ok: true },
    );
  };

  const onReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sb || busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setMsg(null);
    const { error } = await sb.auth.updateUser({ password: String(fd.get("password") ?? "") });
    setBusy(false);
    if (error) return setMsg({ text: error.message, ok: false });
    recovering.current = false;
    history.replaceState(null, "", location.pathname + location.search);
    const { data } = await sb.auth.getSession();
    await refresh(data.session);
    setMsg({ text: "Đã đổi mật khẩu.", ok: true });
  };

  const logout = async () => {
    if (!sb) return;
    await sb.auth.signOut();
    clearGateCookie();
    setMsg(null);
    setView("login");
  };

  const full = quota !== null && quota !== "error" && quota.remaining <= 0;

  /* ---------- Giao diện ---------- */

  const messageBox = msg && (
    <p
      role="status"
      className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-bold ${msg.ok ? "bg-matcha/20 text-ink" : "bg-sakura-deep/15 text-sakura-deep"}`}
    >
      {msg.text}
    </p>
  );

  return (
    <div className="text-ink">
      {/* Trang bìa */}
      <header className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#f6d9de] p-8 text-center">
        <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${bgUrl}")` }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#7a3c50]/25 via-transparent to-[#7a3c50]/40" />
        <div className="relative">
          <MochiFace className="animate-wobble mx-auto mb-4 h-20 w-20 drop-shadow-lg" />
          <h1 className="font-display text-5xl font-black text-white drop-shadow-[0_2px_24px_rgba(120,60,80,.6)] sm:text-6xl md:text-7xl">
            Tiệm Bánh Mochi
          </h1>
          <p className="mt-3 text-lg font-bold text-white drop-shadow-[0_1px_12px_rgba(120,60,80,.6)] md:text-xl">
            Mùa đông nhỏ xinh, bánh ngọt còn ấm.
          </p>
        </div>
        <button
          type="button"
          onClick={() => document.getElementById("gate")?.scrollIntoView({ behavior: "smooth" })}
          aria-label="Cuộn xuống để vào tiệm"
          className="absolute bottom-8 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-white/80 text-sakura-deep shadow-lg backdrop-blur motion-safe:animate-bounce"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </header>

      {/* Cổng vào */}
      <section id="gate" className="grid min-h-dvh place-items-center px-4 py-14">
        <div className="shadow-mochi w-full max-w-md rounded-[2rem] bg-surface p-7 ring-1 ring-line sm:p-9">
          <div className="text-center">
            <MochiFace className="mx-auto h-14 w-14" />
            <h2 className="mt-2 font-display text-2xl font-black">Cổng tiệm bánh</h2>
            <p className="text-sm text-muted">Đăng nhập hoặc tạo tài khoản để vào tiệm.</p>
          </div>

          {!sb && (
            <div className="mt-6 text-center">
              <p className="rounded-xl bg-sakura-deep/15 px-4 py-2.5 text-sm font-bold text-sakura-deep">
                Chưa kết nối Supabase nên chưa thể đăng nhập.
              </p>
              <Link href="/" className={`${btn} inline-block`}>Vào tiệm</Link>
            </div>
          )}

          {sb && view === null && (
            <div className="grid place-items-center py-10" aria-busy="true" aria-label="Đang tải">
              <MochiFace className="animate-wobble h-12 w-12" />
            </div>
          )}

          {sb && view === "member" && (
            <div className="mt-6 text-center">
              <p className="font-display text-lg font-extrabold">Chào {username}!</p>
              <p className="mt-1 text-sm text-muted">Bạn đã vào tiệm. Tên này sẽ hiện khi bạn bình luận.</p>
              <button type="button" className={btn} onClick={() => router.push(nextPath.current)}>
                Vào tiệm
              </button>
              <button type="button" className={btnGhost} onClick={logout}>
                Đăng xuất
              </button>
              {messageBox}
            </div>
          )}

          {sb && view === "signup" && (
            <form onSubmit={onSignup} className="mt-5">
              <h3 className="font-display text-lg font-extrabold">Tạo tài khoản</h3>
              <p className="mt-1 inline-block rounded-full bg-sakura/25 px-3 py-0.5 text-xs font-extrabold text-sakura-deep">
                {quota === null
                  ? "Đang kiểm tra lượt…"
                  : quota === "error"
                    ? "Chưa kiểm tra được lượt hôm nay"
                    : full
                      ? "Hết lượt hôm nay"
                      : `Hôm nay còn ${quota.remaining}/${quota.limit} lượt`}
              </p>
              {full ? (
                <p className="mt-4 rounded-xl bg-sakura-deep/15 px-4 py-3 text-sm font-bold text-sakura-deep">
                  {SIGNUP_ERRORS.full}
                </p>
              ) : (
                <>
                  <label htmlFor="g-email" className={label}>Email</label>
                  <input id="g-email" name="email" type="email" required autoComplete="email" className={input} />

                  <label htmlFor="g-user" className={label}>Tên của bạn (hiện khi bình luận)</label>
                  <input
                    id="g-user"
                    name="username"
                    type="text"
                    required
                    minLength={3}
                    maxLength={24}
                    pattern="[\p{L}0-9_ ]{3,24}"
                    title="3–24 ký tự: chữ, số, dấu cách hoặc dấu gạch dưới"
                    autoComplete="nickname"
                    className={input}
                  />

                  <label htmlFor="g-pass" className={label}>Mật khẩu</label>
                  <input id="g-pass" name="password" type="password" required minLength={8} autoComplete="new-password" className={input} />

                  <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-sakura-deep,#e56b8a)]"
                    />
                    <span>
                      Tôi đã đọc và đồng ý với{" "}
                      <button type="button" className={linkCls} onClick={() => dlg.current?.showModal()}>
                        quy định người dùng
                      </button>
                    </span>
                  </label>

                  <button type="submit" disabled={busy || !agree} className={btn}>
                    {busy ? "Đang xử lý…" : "Tạo tài khoản"}
                  </button>
                </>
              )}
              {messageBox}
              <p className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                <span>Đã có tài khoản?</span>
                <button type="button" className={linkCls} onClick={() => goTo("login")}>Đăng nhập</button>
              </p>
            </form>
          )}

          {sb && view === "login" && (
            <form onSubmit={onLogin} className="mt-5">
              <h3 className="font-display text-lg font-extrabold">Đăng nhập</h3>
              <p className="mt-1 text-sm text-muted">Chào mừng bạn quay lại tiệm.</p>
              <label htmlFor="l-email" className={label}>Email</label>
              <input id="l-email" name="email" type="email" required autoComplete="email" className={input} />
              <label htmlFor="l-pass" className={label}>Mật khẩu</label>
              <input id="l-pass" name="password" type="password" required autoComplete="current-password" className={input} />
              <button type="submit" disabled={busy} className={btn}>
                {busy ? "Đang xử lý…" : "Đăng nhập"}
              </button>
              {messageBox}
              <p className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
                <button type="button" className={linkCls} onClick={() => goTo("forgot")}>Quên mật khẩu?</button>
                <button type="button" className={linkCls} onClick={() => goTo("signup")}>Tạo tài khoản mới</button>
              </p>
            </form>
          )}

          {sb && view === "forgot" && (
            <form onSubmit={onForgot} className="mt-5">
              <h3 className="font-display text-lg font-extrabold">Quên mật khẩu</h3>
              <p className="mt-1 text-sm text-muted">Nhập email, tiệm sẽ gửi liên kết đặt lại mật khẩu.</p>
              <label htmlFor="f-email" className={label}>Email</label>
              <input id="f-email" name="email" type="email" required autoComplete="email" className={input} />
              <button type="submit" disabled={busy} className={btn}>
                {busy ? "Đang gửi…" : "Gửi liên kết"}
              </button>
              {messageBox}
              <p className="mt-5 text-center text-sm">
                <button type="button" className={linkCls} onClick={() => goTo("login")}>Quay lại đăng nhập</button>
              </p>
            </form>
          )}

          {sb && view === "reset" && (
            <form onSubmit={onReset} className="mt-5">
              <h3 className="font-display text-lg font-extrabold">Mật khẩu mới</h3>
              <label htmlFor="r-pass" className={label}>Mật khẩu mới</label>
              <input id="r-pass" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Ít nhất 8 ký tự" className={input} />
              <button type="submit" disabled={busy} className={btn}>
                {busy ? "Đang lưu…" : "Lưu mật khẩu"}
              </button>
              {messageBox}
            </form>
          )}
        </div>
      </section>

      {/* Điều khoản */}
      <dialog
        ref={dlg}
        aria-labelledby="terms-title"
        className="m-auto w-[92%] max-w-lg rounded-[1.75rem] bg-surface p-7 text-ink shadow-2xl ring-1 ring-line backdrop:bg-[#3b2a2e]/55"
      >
        <h3 id="terms-title" className="font-display text-xl font-black">Quy định người dùng</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>Mỗi ngày tiệm chỉ nhận <b>10</b> tài khoản mới. Hết lượt, vui lòng quay lại vào ngày mai.</li>
          <li>Tài khoản đăng ký nhưng <b>không đăng nhập trong 1 tháng</b> sẽ bị xóa.</li>
          <li>Tài khoản <b>2 năm không đăng nhập</b> sẽ bị khóa. Email đã khóa không thể đăng ký lại.</li>
          <li>Dữ liệu tài khoản bị khóa sẽ được xóa hẳn sau <b>5 năm</b>.</li>
          <li>Bình luận văn minh, không spam, không xúc phạm người khác.</li>
        </ol>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="press rounded-full bg-surface-2 px-5 py-2.5 font-extrabold ring-1 ring-line" onClick={() => dlg.current?.close()}>
            Đóng
          </button>
          <button
            type="button"
            className="press rounded-full bg-sakura-deep px-5 py-2.5 font-extrabold text-white"
            onClick={() => {
              setAgree(true);
              dlg.current?.close();
            }}
          >
            Tôi đồng ý
          </button>
        </div>
      </dialog>
    </div>
  );
}
