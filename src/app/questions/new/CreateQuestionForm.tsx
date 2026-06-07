"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { QUESTION_CATEGORIES } from "@/lib/constants";
import type { QuestionCategoryValue } from "@/lib/constants";

interface CreateQuestionFormProps {
  userId: string;
}

export function CreateQuestionForm({ userId }: CreateQuestionFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhotoChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB.");
      return;
    }
    setError(null);
    setUploading(true);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("question-images")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("question-images")
      .getPublicUrl(path);

    setPhotoUrl(publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const title = (form.get("title") as string).trim();
    const content = (form.get("content") as string).trim();
    const category = form.get("category") as QuestionCategoryValue;

    const { data: question, error: insertError } = await supabase
      .from("questions")
      .insert({ user_id: userId, title, content, category, photo_url: photoUrl })
      .select("id")
      .single();

    if (insertError || !question) {
      setError(insertError?.message ?? "Failed to post question.");
      setLoading(false);
      return;
    }

    router.push(`/questions/${question.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <Input
        label="Title"
        name="title"
        required
        maxLength={120}
        placeholder="What's wrong with my Monstera leaves?"
      />
      <Textarea
        label="Details"
        name="content"
        required
        rows={5}
        maxLength={2000}
        placeholder="Describe what you're seeing, how long it's been happening, care routine, etc."
      />
      <Select
        label="Category"
        name="category"
        required
        options={QUESTION_CATEGORIES.map((c) => ({
          value: c.value,
          label: `${c.emoji} ${c.label}`,
        }))}
        defaultValue="general"
      />

      {/* Photo */}
      <div>
        <p className="mb-2 text-sm font-medium text-earth-800">
          Photo (optional)
        </p>
        {photoUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <Image src={photoUrl} alt="Question photo" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setPhotoUrl(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-28 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-leaf-300 bg-leaf-50 text-sm text-leaf-600 hover:border-leaf-400 disabled:opacity-50"
          >
            <span className="text-xl">📷</span>
            <span>{uploading ? "Uploading..." : "Add a photo"}</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading || uploading}>
          {loading ? "Posting..." : "Post question"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/questions")}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
