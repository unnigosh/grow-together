"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface CreatePostFormProps {
  userId: string;
}

export function CreatePostForm({ userId }: CreatePostFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
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
      .from("post-images")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("post-images")
      .getPublicUrl(path);

    setPhotoUrl(publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    setError(null);
    setLoading(true);

    const post_type = photoUrl ? "photo" : "text";

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: userId,
      content: text,
      photo_url: photoUrl,
      post_type,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <Textarea
        label="What's growing?"
        name="content"
        required
        rows={5}
        maxLength={1000}
        placeholder="Share an update, a tip, a harvest, or anything plant-related..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <p className="text-right text-xs text-earth-800/40">
        {content.length}/1000
      </p>

      {/* Photo */}
      <div>
        <p className="mb-2 text-sm font-medium text-earth-800">
          Photo (optional)
        </p>
        {photoUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <Image src={photoUrl} alt="Post photo" fill className="object-cover" />
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
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading || uploading || !content.trim()}
        >
          {loading ? "Posting..." : "Post"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/")}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
