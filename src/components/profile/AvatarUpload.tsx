"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string | null;
  displayName?: string | null;
  onAvatarChange: (url: string | null) => void;
}

export function AvatarUpload({
  userId,
  currentUrl,
  displayName,
  onAvatarChange,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentUrl ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setError(null);
    setUploading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const url = `${publicUrl}?t=${Date.now()}`;
    setPreviewUrl(url);
    onAvatarChange(url);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    setPreviewUrl(null);
    onAvatarChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        {previewUrl ? (
          <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-white shadow-md">
            <Image
              src={previewUrl}
              alt={displayName ?? "Profile"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <Avatar
            src={null}
            name={displayName}
            size="xl"
            className="ring-4 ring-white shadow-md"
          />
        )}
      </div>

      <div className="flex flex-col items-center gap-2 sm:items-start">
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : previewUrl ? "Change photo" : "Upload photo"}
          </button>
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="rounded-xl border border-earth-200 px-4 py-2 text-sm font-medium text-earth-800 hover:bg-earth-50 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-center text-xs text-earth-800/60 sm:text-left">
          JPEG, PNG, or WebP · max 5MB
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
