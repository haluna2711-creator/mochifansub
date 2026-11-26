"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Release, ReleaseStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Cover } from "@/components/Cover";
import { IconTrash, IconX } from "@/components/Icons";
import { Button, Field, Spinner, inputCls } from "./ui";
import { TorrentManager } from "./TorrentManager";

const SEASONS = ["", "Đông", "Xuân", "Hạ", "Thu"];

type Form = {
  title: string;
  slug: string;
  title_jp: string;
  synopsis: string;
  cover_url: string;
  banner_url: string;
  genres: string;
  year: string;
  season: string;
  status: ReleaseStatus;
  total_episodes: string;
  featured: boolean;
};

const toForm = (r: Release | null): Form => ({
  title: r?.title ?? "",
  slug: r?.slug ?? "",
  title_jp: r?.title_jp ?? "",
  synopsis: r?.synopsis ?? "",
  cover_url: r?.cover_url ?? "",
  banner_url: r?.banner_url ?? "",
  genres: r?.genres.join(", ") ?? "",
  year: r?.year?.toString() ?? new Date().getFullYear().toString(),
  season: r?.season ?? "",
  status: r?.status ?? "ongoing",
  total_episodes: r?.total_episodes?.toString() ?? "",
  featured: r?.featured ?? false,
});

export async function uploadToStorage(sb: SupabaseClient, file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, "")) || "file"}.${ext}`;
  const { error } = await sb.storage.from("covers").upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return sb.storage.from("covers").getPublicUrl(path).data.publicUrl;
}

export function ReleaseEditor({
  sb,
  release,
  onClose,
  onSaved,
  onDeleted,
}: {
  sb: SupabaseClient;
  release: Release | null;
  onClose: () => void;
  onSaved: (r: Release | null) => void;
  onDeleted: () => void;
}) {
  const [f, setF] = useState<Form>(() => toForm(release));
  const [slugTouched, setSlugTouched] = useState(Boolean(release));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<"cover" | "banner" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setF(toForm(release));
    setSlugTouched(Boolean(release));
  }, [release]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const upload = async (kind: "cover" | "banner", file?: File) => {
    if (!file) return;
    setUploading(kind);
    try {
      const url = await uploadToStorage(sb, file, kind === "cover" ? "posters" : "banners");
      set(kind === "cover" ? "cover_url" : "banner_url", url);
    } catch (e) {
      setMsg({ ok: false, text: `Tải ảnh lỗi: ${(e as Error).message}` });
    }
    setUploading(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const payload = {
      title: f.title.trim(),
      slug: slugify(f.slug || f.title),
      title_jp: f.title_jp.trim() || null,
      synopsis: f.synopsis.trim() || null,
      cover_url: f.cover_url.trim() || null,
      banner_url: f.banner_url.trim() || null,
      genres: f.genres.split(",").map((g) => g.trim()).filter(Boolean),
      year: f.year ? Number(f.year) : null,
      season: f.season || null,
      status: f.status,
      total_episodes: f.total_episodes ? Number(f.total_episodes) : null,
      featured: f.featured,
    };
    const req = release
      ? sb.from("releases").update(payload).eq("id", release.id).select().single()
      : sb.from("releases").insert(payload).select().single();
    const { data, error } = await req;
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: error.code === "23505" ? "Slug đã tồn tại, hãy đổi slug khác." : error.message });
      return;
    }
    setMsg({ ok: true, text: release ? "Đã lưu thay đổi ✓" : "Đã tạo phim — giờ thêm link torrent bên dưới ✓" });
    onSaved(data as Release);
  };

  const remove = async () => {
    if (!release || !confirm(`Xoá “${release.title}” và toàn bộ link torrent?`)) return;
    setBusy(true);
    const { error } = await sb.from("releases").delete().eq("id", release.id);
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    onDeleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button type="button" aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative flex h-full w-full max-w-2xl flex-col bg-bg shadow-2xl md:rounded-l-[2rem]"
        style={{ animation: "rise .45s var(--ease-mochi) both" }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-black">{release ? "Sửa phim" : "Thêm phim mới"}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="press ml-auto grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-line">
            <IconX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          <form onSubmit={save} className="space-y-5">
            <div className="grid grid-cols-[7rem_1fr] gap-4 sm:grid-cols-[9rem_1fr]">
              <div>
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl ring-1 ring-line">
                  <Cover src={f.cover_url || null} title={f.title || "Poster"} titleJp={f.title_jp} sizes="144px" />
                  {uploading === "cover" && (
                    <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
                      <Spinner className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <label className="press mt-2 block cursor-pointer rounded-full bg-surface py-2 text-center text-xs font-extrabold ring-1 ring-line hover:bg-surface-2">
                  Tải poster
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => upload("cover", e.target.files?.[0])} />
                </label>
              </div>
              <div className="space-y-4">
                <Field label="Tên phim *">
                  <input
                    className={inputCls}
                    required
                    value={f.title}
                    onChange={(e) => {
                      set("title", e.target.value);
                      if (!slugTouched) set("slug", slugify(e.target.value));
                    }}
                  />
                </Field>
                <Field label="Tên tiếng Nhật">
                  <input className={`${inputCls} font-jp`} value={f.title_jp} onChange={(e) => set("title_jp", e.target.value)} placeholder="四月の桜" />
                </Field>
                <Field label="Slug (đường dẫn)" hint={`/anime/${slugify(f.slug || f.title) || "..."}`}>
                  <input
                    className={inputCls}
                    value={f.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", e.target.value);
                    }}
                  />
                </Field>
              </div>
            </div>

            <Field label="Ảnh poster (URL)" hint="Tỉ lệ 2:3, hoặc bấm “Tải poster”.">
              <input className={inputCls} value={f.cover_url} onChange={(e) => set("cover_url", e.target.value)} placeholder="https://…" />
            </Field>

            <Field label="Ảnh banner (URL)" hint="Ngang 16:9, hiển thị ở slide nổi bật & đầu trang chi tiết.">
              <div className="flex gap-2">
                <input className={inputCls} value={f.banner_url} onChange={(e) => set("banner_url", e.target.value)} placeholder="https://…" />
                <label className="press grid shrink-0 cursor-pointer place-items-center rounded-2xl bg-surface px-4 text-xs font-extrabold ring-1 ring-line hover:bg-surface-2">
                  {uploading === "banner" ? <Spinner /> : "Tải lên"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => upload("banner", e.target.files?.[0])} />
                </label>
              </div>
            </Field>

            <Field label="Tóm tắt">
              <textarea className={`${inputCls} min-h-28 resize-y`} value={f.synopsis} onChange={(e) => set("synopsis", e.target.value)} />
            </Field>

            <Field label="Thể loại" hint="Cách nhau bởi dấu phẩy, ví dụ: Lãng mạn, Học đường">
              <input className={inputCls} value={f.genres} onChange={(e) => set("genres", e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Năm">
                <input className={inputCls} type="number" inputMode="numeric" value={f.year} onChange={(e) => set("year", e.target.value)} />
              </Field>
              <Field label="Mùa">
                <select className={inputCls} value={f.season} onChange={(e) => set("season", e.target.value)}>
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{s || "—"}</option>
                  ))}
                </select>
              </Field>
              <Field label="Trạng thái">
                <select className={inputCls} value={f.status} onChange={(e) => set("status", e.target.value as ReleaseStatus)}>
                  <option value="ongoing">Đang tiến hành</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="upcoming">Sắp ra mắt</option>
                </select>
              </Field>
              <Field label="Số tập">
                <input className={inputCls} type="number" inputMode="numeric" value={f.total_episodes} onChange={(e) => set("total_episodes", e.target.value)} />
              </Field>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
              <input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="h-5 w-5 accent-[var(--sakura-deep)]" />
              <span>
                <span className="block text-sm font-bold">★ Nổi bật</span>
                <span className="block text-xs text-muted">Hiển thị trong slide lớn ở trang chủ</span>
              </span>
            </label>

            {msg && (
              <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${msg.ok ? "bg-matcha/20 text-matcha-deep" : "bg-red-500/10 text-red-600 dark:text-red-300"}`}>
                {msg.text}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy || !!uploading}>
                {busy && <Spinner />} {release ? "Lưu thay đổi" : "Tạo phim"}
              </Button>
              {release && (
                <>
                  <a href={`/anime/${release.slug}`} target="_blank" className="press inline-flex h-11 items-center rounded-full bg-surface px-5 text-sm font-extrabold ring-1 ring-line">
                    Xem trang ↗
                  </a>
                  <Button type="button" variant="danger" className="ml-auto" onClick={remove} disabled={busy}>
                    <IconTrash /> Xoá
                  </Button>
                </>
              )}
            </div>
          </form>

          {release && (
            <div className="mt-10 border-t border-line pt-8">
              <TorrentManager sb={sb} release={release} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
