import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeaderNav } from "./HeaderNav";
import { BottomNav } from "./BottomNav";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let unreadCount = 0;

  if (user) {
    const [profileResult, notifResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", user.id)
        .single(),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null),
    ]);

    profile = profileResult.data;
    unreadCount = notifResult.count ?? 0;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-earth-200/60 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-leaf-700">
            <span className="text-xl" aria-hidden>🌿</span>
            <span className="hidden text-base font-bold tracking-tight sm:inline">GrowTogether</span>
          </Link>
          <HeaderNav user={user} profile={profile} unreadCount={unreadCount} />
        </div>
      </header>
      <BottomNav user={user} unreadCount={unreadCount} />
    </>
  );
}
