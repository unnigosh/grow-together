"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import type { Profile } from "@/lib/types/database";

interface EditProfileFormProps {
  profile: Profile;
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile.avatar_url ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        bio: bio || null,
        location: location || null,
        avatar_url: avatarUrl,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push(`/profile/${profile.username}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div className="rounded-2xl border border-earth-200/80 bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-medium text-earth-800">Profile photo</p>
        <AvatarUpload
          userId={profile.id}
          currentUrl={profile.avatar_url}
          displayName={fullName || profile.username}
          onAvatarChange={setAvatarUrl}
        />
      </div>

      <Input
        label="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <Input
        label="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Your city or neighborhood"
      />
      <Textarea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={5}
        placeholder="Tell neighbors about your garden, what you grow, and what you love to trade..."
      />
      <p className="text-xs text-earth-800/50">
        Username (@{profile.username}) cannot be changed in this MVP.
      </p>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save profile"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/profile/${profile.username}`)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
