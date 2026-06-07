"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DeleteQuestionButtonProps {
  questionId: string;
}

export function DeleteQuestionButton({ questionId }: DeleteQuestionButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await supabase.from("questions").delete().eq("id", questionId);
    router.push("/questions");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-earth-800/60">Delete this question?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-earth-800/50 hover:underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-earth-800/40 hover:text-red-500 transition-colors"
    >
      Delete question
    </button>
  );
}
