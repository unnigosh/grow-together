"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { QUESTION_CATEGORIES } from "@/lib/constants";

export function QuestionCategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== active) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    router.push(`/questions?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => select("")}
        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
          active === ""
            ? "bg-leaf-600 text-white"
            : "bg-earth-100 text-earth-800 hover:bg-earth-200"
        }`}
      >
        All
      </button>
      {QUESTION_CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => select(cat.value)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            active === cat.value
              ? "bg-leaf-600 text-white"
              : "bg-earth-100 text-earth-800 hover:bg-earth-200"
          }`}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}
