"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function MarkReadRefresher({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (hasUnread) {
      router.refresh();
    }
  }, [hasUnread, router]);

  return null;
}
