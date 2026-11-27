"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { PROFILE_EVENT, type MyProfile } from "@/lib/profile";
import { UserAvatar } from "./UserAvatar";

/** Nút avatar trên header → mở trang hồ sơ. Chưa đăng nhập thì không hiện. */
export function UserChip() {
  const [me, setMe] = useState<MyProfile | null>(null);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data } = await sb.auth.getSession();
    const u = data.session?.user;
    if (!u) return setMe(null);
    const { data: p } = await sb.from("public_profiles").select("username,avatar_url").eq("id", u.id).maybeSingle();
    setMe({
      username: p?.username || (u.user_metadata?.username as string | undefined) || "Bạn",
      avatar_url: p?.avatar_url ?? null,
    });
  }, []);

  useEffect(() => {
    load();
    const sb = getBrowserSupabase();
    // Không gọi Supabase trực tiếp trong callback (dễ bị treo) → hoãn sang lượt sau
    const { data: sub } = sb?.auth.onAuthStateChange(() => setTimeout(load, 0)) ?? { data: null };
    window.addEventListener(PROFILE_EVENT, load);
    return () => {
      sub?.subscription.unsubscribe();
      window.removeEventListener(PROFILE_EVENT, load);
    };
  }, [load]);

  if (!me) return null;
  return (
    <Link href="/profile" aria-label={`Hồ sơ của ${me.username}`} title={me.username} className="press rounded-full">
      <UserAvatar name={me.username} src={me.avatar_url} className="h-10 w-10 text-base" />
    </Link>
  );
}
