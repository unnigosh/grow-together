"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/Input";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      router.push(`/?${params.toString()}`);
    },
    [query, router, searchParams]
  );

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        type="search"
        placeholder="Search plants, seeds, produce..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
        aria-label="Search listings"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-leaf-700"
      >
        Search
      </button>
    </form>
  );
}
