"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";

interface AddNoteFormProps {
  plantId: string;
  userId: string;
}

export function AddNoteForm({ plantId, userId }: AddNoteFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handlePhotoChange(file: File | null) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("plant-images")
      .upload(path, file, { upsert: false });
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from("plant-images")
      .getPublicUrl(path);
    setPhotoUrl(publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const content = (form.get("content") as string).trim();
    const heightRaw = form.get("height_cm") as string;
    const height_cm = heightRaw ? parseFloat(heightRaw) : null;

    const { error: insertError } = await supabase.from("plant_notes").insert({
      plant_id: plantId,
      user_id: userId,
      content,
      photo_url: photoUrl,
      height_cm,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setOpen(false);
    setPhotoUrl(null);
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        + Add note
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-earth-200 bg-white p-4 shadow-sm space-y-4"
    >
      <Textarea
        label="Note"
        name="content"
        required
        rows={3}
        placeholder="Watered, repotted, new growth spotted..."
        autoFocus
      />
      <Input
        label="Height (cm, optional)"
        name="height_cm"
        type="number"
        min="0"
        step="0.1"
        placeholder="e.g. 32.5"
      />
      <div>
        <p className="mb-2 text-sm font-medium text-earth-800">Photo (optional)</p>
        {photoUrl ? (
          <div className="relative h-28 w-28 overflow-hidden rounded-xl">
            <Image src={photoUrl} alt="Note photo" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setPhotoUrl(null)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-leaf-300 bg-leaf-50 text-leaf-600 hover:border-leaf-400 disabled:opacity-50"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs">{uploading ? "..." : "Photo"}</span>
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
        <Button type="submit" size="sm" disabled={loading || uploading}>
          {loading ? "Saving..." : "Save note"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => { setOpen(false); setPhotoUrl(null); setError(null); }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
