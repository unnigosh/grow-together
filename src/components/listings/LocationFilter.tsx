"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

export function LocationFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("location") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("location", value.trim());
    } else {
      params.delete("location");
    }
    router.push(`/market?${params.toString()}`);
  }

  function handleClear() {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("location");
    const qs = params.toString();
    router.push(qs ? `/market?${qs}` : "/market");
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-earth-800/40">
          📍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Filter by city or area…"
          className="w-full rounded-xl border border-earth-200 bg-white py-2.5 pl-9 pr-8 text-sm text-earth-900 placeholder:text-earth-800/40 focus:border-leaf-400 focus:outline-none focus:ring-2 focus:ring-leaf-200"
          aria-label="Filter by location"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear location"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-earth-800/40 hover:text-earth-800"
          >
            ×
          </button>
        )}
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-leaf-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-leaf-700"
      >
        Go
      </button>
    </form>
  );
}
