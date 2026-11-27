"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { NAME_MAX } from "@/lib/comments";
import { AVATAR_MAX, PROFILE_ERRORS, PROFILE_EVENT, checkAvatarUrl } from "@/lib/profile";
import { UserAvatar } from "@/components/UserAvatar";

const field =
  "w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink ring-1 ring-line outline-none transition placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-sakura";

export function ProfileEditor() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return setReady(true);
    sb.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      if (u) {
        setSignedIn(true);
        const { data: p } = await sb.from("public_profiles").select("username,avatar_url").eq("id", u.id).maybeSingle();
        setName(p?.username || (u.user_metadata?.username as string | undefined) || "");
        setAvatar(p?.avatar_url ?? "");
      }
      setReady(true);
    });
  }, []);

  const checked = checkAvatarUrl(avatar);
  const previewUrl = checked.ok ? checked.url : null;
  useEffect(() => setPreviewFailed(false), [previewUrl]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getBrowserSupabase();
    if (!sb || busy) return;
    if (!checked.ok) return setMsg({ ok: false, text: PROFILE_ERRORS.bad_avatar });
    setBusy(true);
    setMsg(null);
    const { data, error } = await sb.rpc("update_my_profile", { p_username: name, p_avatar_url: checked.url });
    setBusy(false);
    if (error) {
      return setMsg({ ok: false, text: "Chưa lưu được, thử lại sau nhé. (Đã chạy supabase/add-profiles.sql chưa?)" });
    }
    if (data !== "ok") return setMsg({ ok: false, text: PROFILE_ERRORS[data as string] ?? "Chưa lưu được." });
    setMsg({ ok: true, text: "Đã lưu hồ sơ 🍡" });
    window.dispatchEvent(new Event(PROFILE_EVENT));
  };

  if (!ready) return <div className="skeleton mt-6 h-64 rounded-[2rem]" />;
  if (!signedIn) {
    return (
      <p className="mt-6 rounded-3xl bg-surface px-5 py-8 text-center text-sm text-muted ring-1 ring-line">
        Bạn cần đăng nhập để chỉnh hồ sơ.
      </p>
    );
  }

  return (
    <form onSubmit={save} className="shadow-mochi mt-6 rounded-[2rem] bg-surface p-5 ring-1 ring-line sm:p-6">
      <div className="flex items-center gap-4">
        <UserAvatar
          name={name || "?"}
          src={previewUrl}
          className="h-20 w-20 text-3xl"
          onLoadChange={(ok) => setPreviewFailed(!ok)}
        />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-extrabold">{name.trim() || "Chưa có tên"}</p>
          <p className="text-xs text-muted">Xem trước</p>
        </div>
      </div>

      <label className="mt-5 block text-sm font-bold" htmlFor="pf-name">
        Tên hiển thị
      </label>
      <input
        id="pf-name"
        className={`${field} mt-1.5`}
        value={name}
        maxLength={NAME_MAX}
        onChange={(e) => setName(e.target.value)}
        autoComplete="nickname"
        required
        minLength={2}
      />

      <label className="mt-4 block text-sm font-bold" htmlFor="pf-avatar">
        Link ảnh đại diện
      </label>
      <input
        id="pf-avatar"
        className={`${field} mt-1.5`}
        value={avatar}
        maxLength={AVATAR_MAX}
        onChange={(e) => setAvatar(e.target.value)}
        placeholder="https://… (để trống nếu không dùng ảnh)"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
      />
      <p className="mt-1.5 text-xs text-muted">
        Chỉ nhận link ảnh bắt đầu bằng https:// (không tải ảnh lên được). Hãy dán link ảnh trực tiếp, ví dụ đuôi .jpg, .png, .webp.
      </p>
      {!checked.ok && <p className="mt-1.5 text-xs font-bold text-red-600 dark:text-red-300">{PROFILE_ERRORS.bad_avatar}</p>}
      {checked.ok && previewUrl && previewFailed && (
        <p className="mt-1.5 text-xs font-bold text-red-600 dark:text-red-300">
          Không tải được ảnh từ link này. Hãy thử link khác.
        </p>
      )}
      {avatar && (
        <button type="button" onClick={() => setAvatar("")} className="mt-2 text-xs font-bold text-sakura-deep underline underline-offset-2">
          Bỏ ảnh đại diện
        </button>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || name.trim().length < 2 || !checked.ok}
          className="press inline-flex h-11 items-center rounded-full bg-sakura-deep px-6 text-sm font-extrabold text-white shadow-[0_8px_20px_-10px] shadow-sakura-deep hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
        >
          {busy ? "Đang lưu…" : "Lưu hồ sơ"}
        </button>
        {msg && (
          <span role="status" className={`text-sm font-bold ${msg.ok ? "text-matcha-deep" : "text-red-600 dark:text-red-300"}`}>
            {msg.text}
          </span>
        )}
      </div>
    </form>
  );
}
