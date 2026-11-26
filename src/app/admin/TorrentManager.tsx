"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Release, Torrent } from "@/lib/types";
import { IconMagnet, IconTrash } from "@/components/Icons";
import { Button, Field, Spinner, inputCls } from "./ui";
import { uploadToStorage } from "./ReleaseEditor";

const QUALITIES = ["1080p", "720p", "480p", "4K"];

/** Lấy tên file từ magnet (tham số dn=) để đoán chất lượng. */
function parseMagnet(magnet: string) {
  let name = "";
  try {
    const dn = magnet.match(/[?&]dn=([^&]+)/)?.[1];
    if (dn) name = decodeURIComponent(dn.replace(/\+/g, " "));
  } catch {}
  const quality = (name.match(/(2160p|1080p|720p|480p|4K)/i)?.[1] ?? "").replace(/2160p/i, "4K");
  return { name, quality };
}

type Form = { label: string; quality: string; size: string; sub_type: string; magnet: string; torrent_url: string };

const toForm = (t: Torrent | null, release: Release): Form => ({
  label: t?.label ?? "Trọn bộ",
  quality: t?.quality ?? "1080p",
  size: t?.size ?? "",
  sub_type: t?.sub_type ?? "Softsub",
  magnet: t?.magnet ?? "",
  torrent_url: t?.torrent_url ?? "",
});

/** Mỗi phim chỉ có 1 link torrent: form này tạo mới hoặc thay thế link đó. */
export function TorrentManager({ sb, release }: { sb: SupabaseClient; release: Release }) {
  const [current, setCurrent] = useState<Torrent | null>(null);
  const [f, setF] = useState<Form>(() => toForm(null, release));
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await sb
      .from("torrents")
      .select("*")
      .eq("release_id", release.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const t = (data as Torrent) ?? null;
    setCurrent(t);
    setF(toForm(t, release));
    setLoading(false);
  }, [sb, release]);

  useEffect(() => {
    load();
  }, [load]);

  const onMagnet = (m: string) => {
    const p = parseMagnet(m);
    setF((s) => ({ ...s, magnet: m, quality: p.quality || s.quality }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.magnet.trim() && !f.torrent_url.trim()) {
      return setMsg({ ok: false, text: "Cần ít nhất magnet hoặc file .torrent" });
    }
    setBusy(true);
    setMsg(null);
    const { error } = await sb.from("torrents").upsert(
      {
        release_id: release.id,
        label: f.label.trim() || "Trọn bộ",
        episode: null,
        quality: f.quality || null,
        size: f.size.trim() || null,
        sub_type: f.sub_type || null,
        magnet: f.magnet.trim() || null,
        torrent_url: f.torrent_url.trim() || null,
        created_at: new Date().toISOString(),
      },
      { onConflict: "release_id" },
    );
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: current ? "Đã cập nhật link ✓" : "Đã thêm link ✓" });
    load();
  };

  const remove = async () => {
    if (!current || !confirm("Xoá link torrent của phim này?")) return;
    setBusy(true);
    await sb.from("torrents").delete().eq("release_id", release.id);
    setBusy(false);
    setMsg({ ok: true, text: "Đã xoá link" });
    load();
  };

  const uploadTorrent = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToStorage(sb, file, "torrents");
      const p = parseMagnet(`?dn=${encodeURIComponent(file.name)}`);
      setF((s) => ({ ...s, torrent_url: url, quality: p.quality || s.quality }));
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
    setUploading(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-matcha/20 text-matcha-deep">
          <IconMagnet />
        </span>
        <h3 className="font-display text-lg font-black">Link torrent</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
            current ? "bg-matcha/20 text-matcha-deep" : "bg-surface-2 text-muted"
          }`}
        >
          {current ? "Đã có link" : "Chưa có link"}
        </span>
      </div>

      {loading ? (
        <div className="skeleton h-80 rounded-3xl" />
      ) : (
        <form onSubmit={save} className="space-y-3 rounded-3xl bg-surface p-4 ring-1 ring-line">
          <Field label="Magnet" hint="Mỗi phim chỉ có 1 link. Lưu lại sẽ thay thế link cũ.">
            <input
              className={`${inputCls} font-mono text-xs`}
              value={f.magnet}
              onChange={(e) => onMagnet(e.target.value)}
              placeholder="magnet:?xt=urn:btih:…"
            />
          </Field>
          <Field label="hoặc file .torrent">
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={f.torrent_url}
                onChange={(e) => setF({ ...f, torrent_url: e.target.value })}
                placeholder="URL file .torrent"
              />
              <label className="press grid shrink-0 cursor-pointer place-items-center rounded-2xl bg-surface-2 px-4 text-xs font-extrabold ring-1 ring-line">
                {uploading ? <Spinner /> : "Tải lên"}
                <input
                  type="file"
                  accept=".torrent,application/x-bittorrent"
                  className="hidden"
                  onChange={(e) => uploadTorrent(e.target.files?.[0])}
                />
              </label>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Nhãn" className="col-span-2">
              <input
                className={inputCls}
                value={f.label}
                onChange={(e) => setF({ ...f, label: e.target.value })}
                placeholder="Trọn bộ 01-12"
              />
            </Field>
            <Field label="Chất lượng">
              <select className={inputCls} value={f.quality} onChange={(e) => setF({ ...f, quality: e.target.value })}>
                {QUALITIES.map((q) => (
                  <option key={q}>{q}</option>
                ))}
              </select>
            </Field>
            <Field label="Dung lượng">
              <input
                className={inputCls}
                value={f.size}
                onChange={(e) => setF({ ...f, size: e.target.value })}
                placeholder="15.6 GB"
              />
            </Field>
          </div>
          <Field label="Loại sub">
            <select className={inputCls} value={f.sub_type} onChange={(e) => setF({ ...f, sub_type: e.target.value })}>
              <option>Softsub</option>
              <option>Hardsub</option>
            </select>
          </Field>

          {msg && (
            <p
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                msg.ok ? "bg-matcha/20 text-matcha-deep" : "bg-red-500/10 text-red-600 dark:text-red-300"
              }`}
            >
              {msg.text}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="matcha" disabled={busy || uploading}>
              {busy && <Spinner />} {current ? "Cập nhật link" : "Lưu link"}
            </Button>
            {current && (
              <Button type="button" variant="danger" className="ml-auto" onClick={remove} disabled={busy}>
                <IconTrash /> Xoá link
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
