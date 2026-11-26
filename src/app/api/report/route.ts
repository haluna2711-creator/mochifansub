import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Gửi email báo lỗi bánh qua Resend (https://resend.com).
 * Cần 2 biến môi trường (đặt trong Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY   khoá API lấy từ Resend
 *   REPORT_TO_EMAIL  email nhận báo lỗi (nhiều email thì cách nhau bằng dấu phẩy)
 * Tuỳ chọn:
 *   REPORT_FROM_EMAIL  người gửi, mặc định "Tiệm bánh Mochi <onboarding@resend.dev>"
 */

const TYPES = [
  "Link tải bị hỏng",
  "Hết seed / tải rất chậm",
  "Sai hoặc thiếu phụ đề",
  "Sai tên / thông tin bánh",
  "Lỗi khác",
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Giới hạn tần suất theo IP (bộ nhớ của instance — chặn spam cơ bản)
const hits = new Map<string, number[]>();
function tooFast(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  const lastMinute = list.filter((t) => now - t < 60_000).length;
  if (lastMinute >= 2 || list.length >= 5) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function clean(v: unknown, max: number) {
  return typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
}

/** POST /api/report  { title, detail, pageUrl, type, message, contact, website } */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  // Ô ẩn "website": người thật không điền, bot thì có → giả vờ thành công
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const title = clean(body.title, 200);
  const detail = clean(body.detail, 300);
  const pageUrl = clean(body.pageUrl, 500);
  const type = TYPES.includes(clean(body.type, 60)) ? clean(body.type, 60) : "Lỗi khác";
  const message = clean(body.message, 2000);
  const contact = clean(body.contact, 200);

  if (!title) return NextResponse.json({ error: "Thiếu tên bánh" }, { status: 400 });
  if (message.length < 5) return NextResponse.json({ error: "Bạn mô tả lỗi kỹ hơn một chút nhé" }, { status: 400 });
  if (contact && !EMAIL_RE.test(contact)) {
    return NextResponse.json({ error: "Email liên hệ chưa đúng" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = (process.env.REPORT_TO_EMAIL ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  if (!apiKey || to.length === 0) {
    console.error("report: thiếu RESEND_API_KEY hoặc REPORT_TO_EMAIL");
    return NextResponse.json({ error: "Tiệm chưa bật tính năng báo lỗi, bạn quay lại sau nhé" }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooFast(ip)) return NextResponse.json({ error: "Bạn gửi nhanh quá, đợi một chút nhé" }, { status: 429 });

  const lines: string[] = [`Bánh: ${title}`];
  if (detail) lines.push(`Bản tải: ${detail}`);
  if (pageUrl) lines.push(`Link trang: ${pageUrl}`);
  lines.push(`Loại lỗi: ${type}`);
  if (contact) lines.push(`Email người báo: ${contact}`);
  lines.push("", message);
  const text = lines.join("\n");

  const html = `<div style="font-family:sans-serif;line-height:1.6;color:#2b1d20">
<h2 style="margin:0 0 12px">🍡 Báo lỗi bánh: ${esc(title)}</h2>
<p style="margin:0"><b>Loại lỗi:</b> ${esc(type)}</p>
${detail ? `<p style="margin:0"><b>Bản tải:</b> ${esc(detail)}</p>` : ""}
${pageUrl ? `<p style="margin:0"><b>Link trang:</b> <a href="${esc(pageUrl)}">${esc(pageUrl)}</a></p>` : ""}
${contact ? `<p style="margin:0"><b>Email người báo:</b> ${esc(contact)}</p>` : ""}
<hr style="border:none;border-top:1px solid #eadfd4;margin:14px 0">
<p style="white-space:pre-wrap;margin:0">${esc(message)}</p>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.REPORT_FROM_EMAIL?.trim() || "Tiệm bánh Mochi <onboarding@resend.dev>",
        to,
        subject: `[Báo lỗi bánh] ${title}`,
        text,
        html,
        ...(contact ? { reply_to: contact } : {}),
      }),
    });
    if (!res.ok) {
      console.error("report: Resend lỗi", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: "Không gửi được báo lỗi, thử lại sau nhé" }, { status: 502 });
    }
  } catch (e) {
    console.error("report: không gọi được Resend", e);
    return NextResponse.json({ error: "Không gửi được báo lỗi, thử lại sau nhé" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
