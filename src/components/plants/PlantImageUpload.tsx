"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PlantImageUploadProps {
  userId: string;
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  initialImages?: string[];
}

export function PlantImageUpload({
  userId,
  onImagesChange,
  maxImages = 8,
  initialImages = [],
}: PlantImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading(true);

    const newUrls: string[] = [];

    for (const file of Array.from(files).slice(0, maxImages - images.length)) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload image files only.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Images must be under 5MB.");
        continue;
      }

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("plant-images")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("plant-images")
        .getPublicUrl(path);

      newUrls.push(publicUrl);
    }

    const updated = [...images, ...newUrls].slice(0, maxImages);
    setImages(updated);
    onImagesChange(updated);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-xl">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-leaf-300 bg-leaf-50 text-leaf-600 hover:border-leaf-400 disabled:opacity-50"
          >
            <span className="text-2xl">+</span>
            <span className="text-xs">{uploading ? "..." : "Add"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-earth-800/60">
        Up to {maxImages} photos, 5MB each
      </p>
    </div>
  );
}
