"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase";
import { clearGateCookie, safeNext, setGateCookie } from "@/lib/gate";
import { gateOverlayCss } from "@/lib/siteSettings";
import { TERMS, TERMS_INTRO, TERMS_NOTE, TERMS_TITLE } from "@/lib/terms";
import { MochiFace } from "./MochiLogo";
import { AnimatedLogo } from "./AnimatedLogo";

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

/** Ô mật khẩu có nút con mắt ở cuối để hiện / ẩn */
function PasswordField({
  id,
  autoComplete,
  minLength,
  placeholder,
}: {
  id: string;
  autoComplete: string;
  minLength?: number;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name="password"
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${input} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:text-sakura-deep focus-visible:outline-2 focus-visible:outline-sakura-deep"
      >
        {show ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 8 10 8a17.3 17.3 0 0 1-3.17 4.19" />
            <path d="M6.61 6.61A17.1 17.1 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.39-1.61" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <path d="m2 2 20 20" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

const SIGNUP_ERRORS: Record<string, string> = {
  full: "Hôm nay tiệm đã đủ khách. Vui lòng ghé tiệm bánh vào ngày mai.",
  blocked: "Email này đã bị khóa, không thể đăng ký lại.",
  taken: "Tên này đã có người dùng. Hãy chọn tên khác.",
  exists: "Email này đã có tài khoản. Hãy đăng nhập.",
  closed: "Tiệm tạm ngưng nhận khách mới. Bạn quay lại sau nhé!",
};

/** Nhắc khách tìm thư trong mục Thư rác (thư gửi từ Gmail dễ bị rơi vào đó) */
const SPAM_HINT = "Không thấy thư? Hãy kiểm tra mục Thư rác (Spam) nhé.";

export function Gate({ bgUrl, overlay = 30 }: { bgUrl: string; overlay?: number }) {
  const router = useRouter();
  const sb = getBrowserSupabase();

  const [view, setView] = useState<View | null>(null);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [busy, setBusy] = useState(false);
  const [quota, setQuota] = useState<Quota>(null);
  const [signupOpen, setSignupOpen] = useState(true);
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
    // Admin có thể đóng đăng ký; lỗi hoặc chưa chạy SQL → coi như đang mở (DB vẫn chặn nếu thật sự đóng)
    const { data: open } = await sb.rpc("signup_open");
    setSignupOpen(open !== false);
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
    if (!agree) {
      setMsg({ text: "Bạn cần mở nội quy tiệm bánh, đọc và bấm “Tôi đồng ý” trước nhé.", ok: false });
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const name = String(fd.get("username") ?? "").trim().replace(/\s+/g, " ");
    const password = String(fd.get("password") ?? "");
    setBusy(true);
    setMsg(null);

    const { data: open } = await sb.rpc("signup_open");
    if (open === false) {
      setBusy(false);
      setSignupOpen(false);
      setMsg({ text: SIGNUP_ERRORS.closed, ok: false });
      return;
    }

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
      const closed = /signup_closed/i.test(error.message);
      if (closed) setSignupOpen(false);
      setMsg({ text: closed ? SIGNUP_ERRORS.closed : `Đăng ký chưa được: ${error.message}`, ok: false });
      loadQuota();
      return;
    }
    if (data.session) return enter();
    setMsg({
      text: `Đã tạo tài khoản! Hãy kiểm tra email để xác nhận, rồi đăng nhập. ${SPAM_HINT}`,
      ok: true,
    });
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
        ? `Email chưa được xác nhận. Hãy mở email và bấm vào liên kết trong thư (nhớ xem cả mục Thư rác).`
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
        : { text: `Đã gửi liên kết. Hãy kiểm tra email. ${SPAM_HINT}`, ok: true },
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
        <div aria-hidden className="absolute inset-0" style={{ backgroundImage: gateOverlayCss(overlay) }} />
        <div className="relative">
          <AnimatedLogo />
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
              {!signupOpen ? (
                <p className="mt-4 rounded-xl bg-sakura-deep/15 px-4 py-3 text-sm font-bold text-sakura-deep">
                  {SIGNUP_ERRORS.closed}
                </p>
              ) : full ? (
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
                  <PasswordField id="g-pass" minLength={8} autoComplete="new-password" />

                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={agree}
                    onClick={() => dlg.current?.showModal()}
                    className="mt-4 flex w-full items-start gap-2.5 text-left text-sm"
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md ring-1 transition ${
                        agree ? "bg-sakura-deep text-white ring-sakura-deep" : "bg-bg ring-line"
                      }`}
                    >
                      {agree && (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                      )}
                    </span>
                    <span>
                      {agree ? "Đã đồng ý " : "Bấm để đọc và đồng ý "}
                      <span className={linkCls}>nội quy tiệm bánh</span>
                    </span>
                  </button>

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
              <PasswordField id="l-pass" autoComplete="current-password" />
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
              <PasswordField id="r-pass" minLength={8} autoComplete="new-password" placeholder="Ít nhất 8 ký tự" />
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
        className="m-auto w-[92%] max-w-lg overflow-hidden rounded-[1.75rem] bg-surface p-0 text-ink shadow-2xl ring-1 ring-line backdrop:bg-[#3b2a2e]/55"
      >
        <div className="flex max-h-[88dvh] flex-col">
          <div className="overflow-y-auto overscroll-contain px-7 pb-4 pt-7">
            <h3 id="terms-title" className="font-display text-xl font-black uppercase">{TERMS_TITLE}</h3>
            <p className="mt-3 text-sm leading-relaxed">{TERMS_INTRO}</p>
            <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-relaxed marker:font-extrabold">
              {TERMS.map((t) => (
                <li key={t.title}>
                  <p className="font-extrabold">{t.title}</p>
                  <p className="mt-0.5">{t.body}</p>
                  {t.penalty && (
                    <p className="mt-1.5 rounded-xl bg-sakura-deep/10 px-3 py-2">
                      <b className="text-sakura-deep">Hình phạt:</b> {t.penalty}
                    </p>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-5 text-sm font-bold leading-relaxed">{TERMS_NOTE}</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-line bg-surface px-7 py-4">
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
        </div>
      </dialog>
    </div>
  );
}
