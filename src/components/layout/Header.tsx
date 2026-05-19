import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeaderNav } from "./HeaderNav";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-leaf-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-leaf-700">
          <span className="text-2xl" aria-hidden>
            🌿
          </span>
          <span className="hidden sm:inline">GrowTogether</span>
        </Link>
        <HeaderNav user={user} profile={profile} />
      </div>
    </header>
  );
}
