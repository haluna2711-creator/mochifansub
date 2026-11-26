"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Release, Torrent } from "@/lib/types";
import { IconMagnet, IconPlus, IconTrash } from "@/components/Icons";
import { Button, Field, Spinner, inputCls } from "./ui";
import { uploadToStorage } from "./ReleaseEditor";

const QUALITIES = ["1080p", "720p", "480p", "4K"];

/** Đoán tập / chất lượng / tên từ magnet (tham số dn=). */
export function parseMagnet(magnet: string) {
  let name = "";
  try {
    const dn = magnet.match(/[?&]dn=([^&]+)/)?.[1];
    if (dn) name = decodeURIComponent(dn.replace(/\+/g, " "));
  } catch {}
  const quality = name.match(/(2160p|1080p|720p|480p|4K)/i)?.[1] ?? "";
  const batch = name.match(/(\d{1,3})\s*[-~]\s*(\d{1,3})/);
  const ep =
    name.match(/(?:\s-\s|\bE|\bEP|Tập\s?)(\d{1,4}(?:\.\d)?)\b/i)?.[1] ??
    name.match(/\[(\d{1,4})\]/)?.[1] ??
    "";
  const label = /batch/i.test(name) && batch
    ? `Batch ${batch[1]}-${batch[2]}`
    : ep
      ? `Tập ${ep.padStart(2, "0")}`
      : "";
  return { name, quality: quality.replace(/2160p/i, "4K"), episode: ep, label };
}

const empty = { label: "", episode: "", quality: "1080p", size: "", sub_type: "Softsub", magnet: "", torrent_url: "" };

export function TorrentManager({ sb, release }: { sb: SupabaseClient; release: Release }) {
  const [list, setList] = useState<Torrent[]>([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [bulk, setBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await sb
      .from("torrents")
      .select("*")
      .eq("release_id", release.id)
      .order("episode", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    setList((data ?? []) as Torrent[]);
    setLoading(false);
  }, [sb, release.id]);

  useEffect(() => {
    load();
  }, [load]);

  const onMagnet = (m: string) => {
    const p = parseMagnet(m);
    setF((s) => ({
      ...s,
      magnet: m,
      label: s.label || p.label,
      episode: s.episode || (p.label.startsWith("Batch") ? "999" : p.episode),
      quality: p.quality || s.quality,
    }));
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.magnet && !f.torrent_url) return setErr("Cần ít nhất magnet hoặc file .torrent");
    setBusy(true);
    setErr("");
    const { error } = await sb.from("torrents").insert({
      release_id: release.id,
      label: f.label.trim() || "Tập mới",
      episode: f.episode ? Number(f.episode) : null,
      quality: f.quality || null,
      size: f.size.trim() || null,
      sub_type: f.sub_type || null,
      magnet: f.magnet.trim() || null,
      torrent_url: f.torrent_url.trim() || null,
    });
    setBusy(false);
    if (error) return setErr(error.message);
    setF({ ...empty, quality: f.quality, sub_type: f.sub_type });
    load();
  };

  const addBulk = async () => {
    const lines = bulkText.split(/\s+/).filter((l) => l.startsWith("magnet:"));
    if (!lines.length) return setErr("Không tìm thấy magnet nào");
    setBusy(true);
    setErr("");
    const rows = lines.map((m) => {
      const p = parseMagnet(m);
      return {
        release_id: release.id,
        label: p.label || p.name.slice(0, 60) || "Tập mới",
        episode: p.label.startsWith("Batch") ? 999 : p.episode ? Number(p.episode) : null,
        quality: p.quality || null,
        sub_type: "Softsub",
        magnet: m,
      };
    });
    const { error } = await sb.from("torrents").insert(rows);
    setBusy(false);
    if (error) return setErr(error.message);
    setBulkText("");
    setBulk(false);
    load();
  };

  const remove = async (t: Torrent) => {
    if (!confirm(`Xoá “${t.label} ${t.quality ?? ""}”?`)) return;
    await sb.from("torrents").delete().eq("id", t.id);
    load();
  };

  const uploadTorrent = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToStorage(sb, file, "torrents");
      const p = parseMagnet(`?dn=${encodeURIComponent(file.name)}`);
      setF((s) => ({
        ...s,
        torrent_url: url,
        label: s.label || p.label,
        episode: s.episode || p.episode,
        quality: p.quality || s.quality,
      }));
    } catch (e) {
      setErr((e as Error).message);
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
        <span className="text-sm text-muted">({list.length})</span>
        <button
          type="button"
          onClick={() => setBulk((v) => !v)}
          className="press ml-auto rounded-full bg-surface px-3.5 py-1.5 text-xs font-extrabold ring-1 ring-line hover:bg-surface-2"
        >
          {bulk ? "Thêm từng link" : "Dán nhiều magnet"}
        </button>
      </div>

      {bulk ? (
        <div className="space-y-3 rounded-3xl bg-surface p-4 ring-1 ring-line">
          <Field label="Mỗi dòng 1 magnet" hint="Tự nhận tên tập & chất lượng từ tên file (vd: “[Mochi] Tên phim - 05 [1080p].mkv”).">
            <textarea className={`${inputCls} min-h-40 font-mono text-xs`} value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder="magnet:?xt=urn:btih:...&#10;magnet:?xt=urn:btih:..." />
          </Field>
          {err && <p className="text-sm font-semibold text-red-600 dark:text-red-300">{err}</p>}
          <Button type="button" variant="matcha" onClick={addBulk} disabled={busy}>
            {busy ? <Spinner /> : <IconPlus />} Thêm tất cả
          </Button>
        </div>
      ) : (
        <form onSubmit={add} className="space-y-3 rounded-3xl bg-surface p-4 ring-1 ring-line">
          <Field label="Magnet" hint="Dán vào sẽ tự điền tên tập & chất lượng.">
            <input className={`${inputCls} font-mono text-xs`} value={f.magnet} onChange={(e) => onMagnet(e.target.value)} placeholder="magnet:?xt=urn:btih:…" />
          </Field>
          <Field label="hoặc file .torrent">
            <div className="flex gap-2">
              <input className={inputCls} value={f.torrent_url} onChange={(e) => setF({ ...f, torrent_url: e.target.value })} placeholder="URL file .torrent" />
              <label className="press grid shrink-0 cursor-pointer place-items-center rounded-2xl bg-surface-2 px-4 text-xs font-extrabold ring-1 ring-line">
                {uploading ? <Spinner /> : "Tải lên"}
                <input type="file" accept=".torrent,application/x-bittorrent" className="hidden" onChange={(e) => uploadTorrent(e.target.files?.[0])} />
              </label>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Field label="Nhãn" className="col-span-2">
              <input className={inputCls} value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="Tập 01" />
            </Field>
            <Field label="Số tập">
              <input className={inputCls} type="number" step="0.5" value={f.episode} onChange={(e) => setF({ ...f, episode: e.target.value })} />
            </Field>
            <Field label="Chất lượng">
              <select className={inputCls} value={f.quality} onChange={(e) => setF({ ...f, quality: e.target.value })}>
                {QUALITIES.map((q) => <option key={q}>{q}</option>)}
              </select>
            </Field>
            <Field label="Dung lượng">
              <input className={inputCls} value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })} placeholder="1.2 GB" />
            </Field>
          </div>
          <Field label="Loại sub">
            <select className={inputCls} value={f.sub_type} onChange={(e) => setF({ ...f, sub_type: e.target.value })}>
              <option>Softsub</option>
              <option>Hardsub</option>
            </select>
          </Field>
          {err && <p className="text-sm font-semibold text-red-600 dark:text-red-300">{err}</p>}
          <Button type="submit" variant="matcha" disabled={busy || uploading}>
            {busy ? <Spinner /> : <IconPlus />} Thêm link
          </Button>
        </form>
      )}

      <ul className="mt-5 space-y-2">
        {loading ? (
          <li className="skeleton h-16 rounded-2xl" />
        ) : list.length === 0 ? (
          <li className="rounded-2xl bg-surface p-4 text-center text-sm text-muted ring-1 ring-line">Chưa có link nào.</li>
        ) : (
          list.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {t.label} <span className="font-black text-sakura-deep">{t.quality}</span>
                </p>
                <p className="truncate text-xs text-muted">
                  {[t.size, t.sub_type, t.magnet ? "magnet" : null, t.torrent_url ? ".torrent" : null].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button type="button" onClick={() => remove(t)} aria-label="Xoá" className="press grid h-9 w-9 place-items-center rounded-full text-red-500 hover:bg-red-500/10">
                <IconTrash />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
