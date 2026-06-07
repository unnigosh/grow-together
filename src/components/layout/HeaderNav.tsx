"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import type { User } from "@supabase/supabase-js";

interface HeaderNavProps {
  user: User | null;
  profile: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "text-leaf-700"
          : "text-earth-800/70 hover:text-earth-900"
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-leaf-600" />
      )}
    </Link>
  );
}

export function HeaderNav({ user, profile }: HeaderNavProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-0.5 md:flex">
        <NavLink href="/">Feed</NavLink>
        <NavLink href="/market">Market</NavLink>
        <NavLink href="/questions">Questions</NavLink>
        {user && (
          <>
            <NavLink href="/messages">Messages</NavLink>
            <NavLink href={`/profile/${profile?.username}`}>Profile</NavLink>
          </>
        )}
      </nav>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link href="/feed/new" className="hidden sm:block">
              <Button size="sm">+ Post</Button>
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full p-1 transition hover:bg-leaf-50"
                aria-label="Account menu"
              >
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name ?? profile?.username}
                  size="sm"
                />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-earth-200 bg-white shadow-lg">
                    <div className="px-4 py-3 border-b border-earth-100">
                      <p className="text-sm font-semibold text-earth-900 truncate">
                        {profile?.full_name ?? profile?.username}
                      </p>
                      <p className="text-xs text-earth-800/50 truncate">
                        @{profile?.username}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={`/profile/${profile?.username}`}
                        className="block px-4 py-2 text-sm text-earth-800 hover:bg-leaf-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        My profile
                      </Link>
                      <Link
                        href="/plants"
                        className="block px-4 py-2 text-sm text-earth-800 hover:bg-leaf-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Plants
                      </Link>
                      <Link
                        href="/profile/edit"
                        className="block px-4 py-2 text-sm text-earth-800 hover:bg-leaf-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Edit profile
                      </Link>
                      <hr className="my-1 border-earth-100" />
                      <Link
                        href="/feed/new"
                        className="block px-4 py-2 text-sm text-earth-800 hover:bg-leaf-50 md:hidden"
                        onClick={() => setMenuOpen(false)}
                      >
                        New post
                      </Link>
                      <Link
                        href="/listings/new"
                        className="block px-4 py-2 text-sm text-earth-800 hover:bg-leaf-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        New listing
                      </Link>
                      <hr className="my-1 border-earth-100" />
                      <button
                        type="button"
                        onClick={signOut}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
