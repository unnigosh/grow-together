"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

export function CategoryFilter() {
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  function hrefFor(category: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    return qs ? `/market?${qs}` : "/market";
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Link
        href={hrefFor(null)}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
          !active
            ? "bg-leaf-600 text-white"
            : "bg-white text-earth-800 ring-1 ring-earth-200 hover:bg-leaf-50"
        }`}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.value}
          href={hrefFor(cat.value)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
            active === cat.value
              ? "bg-leaf-600 text-white"
              : "bg-white text-earth-800 ring-1 ring-earth-200 hover:bg-leaf-50"
          }`}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}
