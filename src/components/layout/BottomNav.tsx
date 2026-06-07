"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface BottomNavProps {
  user: User | null;
  unreadCount: number;
}

function FeedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MarketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

interface NavTabProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  exact?: boolean;
}

function NavTab({ href, label, icon, badge, exact }: NavTabProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
        isActive ? "text-leaf-700" : "text-earth-800/50 hover:text-earth-800"
      }`}
      aria-label={label}
    >
      <span className={`transition-transform ${isActive ? "scale-110" : ""}`}>
        {icon}
      </span>
      <span>{label}</span>
      {!!badge && badge > 0 && (
        <span className="absolute right-[calc(50%-18px)] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

export function BottomNav({ user, unreadCount }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-earth-200 bg-white/95 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <NavTab href="/" label="Feed" icon={<FeedIcon />} exact />
      <NavTab href="/market" label="Market" icon={<MarketIcon />} />
      {/* Centre + button */}
      <Link
        href="/feed/new"
        className="flex flex-1 flex-col items-center justify-center"
        aria-label="Create post"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-600 text-xl font-light text-white shadow-md transition hover:bg-leaf-700 active:scale-95">
          +
        </span>
      </Link>
      <NavTab href="/questions" label="Questions" icon={<QuestionIcon />} />
      {user ? (
        <NavTab
          href="/notifications"
          label="Alerts"
          icon={<BellIcon />}
          badge={unreadCount}
        />
      ) : (
        <NavTab href="/messages" label="Messages" icon={<MessagesIcon />} />
      )}
    </nav>
  );
}
