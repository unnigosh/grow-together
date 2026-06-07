"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface AddAnswerFormProps {
  questionId: string;
  userId: string;
}

export function AddAnswerForm({ questionId, userId }: AddAnswerFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    setError(null);
    setLoading(true);

    const { error: insertError } = await supabase.from("answers").insert({
      question_id: questionId,
      user_id: userId,
      content: text,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setContent("");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        label="Your answer"
        name="content"
        required
        rows={4}
        maxLength={2000}
        placeholder="Share what you know — personal experience, techniques, or resources..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-earth-800/40">{content.length}/2000</p>
        <Button type="submit" size="sm" disabled={loading || !content.trim()}>
          {loading ? "Posting..." : "Post answer"}
        </Button>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </form>
  );
}
