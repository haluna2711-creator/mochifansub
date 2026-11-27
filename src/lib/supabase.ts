import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function cleanUrl(raw?: string) {
  if (!raw) return undefined;
  let v = raw.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  if (v && !/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    new URL(v);
    return v;
  } catch {
    console.warn("NEXT_PUBLIC_SUPABASE_URL không hợp lệ:", raw);
    return undefined;
  }
}

const url = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/^["']|["']$/g, "");

export const isSupabaseConfigured = Boolean(url && anonKey);

/** Client cho Server Components: không lưu session, chỉ đọc dữ liệu công khai. */
export function getServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let browserClient: SupabaseClient | null = null;

/** Client cho trình duyệt (trang admin): giữ phiên đăng nhập. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "mochi-auth",
        // sessionStorage tự xóa khi đóng tab/trình duyệt → phải đăng nhập lại
        storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
      },
    });
  }
  return browserClient;
}
