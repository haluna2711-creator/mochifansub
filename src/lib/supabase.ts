import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "mochi-auth" },
    });
  }
  return browserClient;
}
