"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase";
import { GATE_DISABLED, clearGateCookie, setGateCookie } from "@/lib/gate";

/** Giữ cookie "mochi-in" khớp với phiên đăng nhập thật; hết phiên thì đưa về /gate. */
export function AuthGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (GATE_DISABLED) return;
    // Dọn phiên cũ còn sót trong localStorage (trước đây phiên được lưu lâu dài)
    try { localStorage.removeItem("mochi-auth"); } catch {}
    const sb = getBrowserSupabase();
    if (!sb) return;
    const exempt = /^\/(gate|admin)(\/|$)/.test(pathname);

    const sync = (signedIn: boolean) => {
      if (signedIn) return setGateCookie();
      clearGateCookie();
      if (!exempt) {
        const wanted = location.pathname + location.search;
        router.replace(wanted === "/" ? "/gate" : `/gate?next=${encodeURIComponent(wanted)}`);
      }
    };

    sb.auth.getSession().then(({ data }) => sync(Boolean(data.session)));
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      sync(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
