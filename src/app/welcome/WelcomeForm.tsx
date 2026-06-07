"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface WelcomeFormProps {
  userId: string;
  fullName: string | null;
}

export function WelcomeForm({ userId, fullName }: WelcomeFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const location = (form.get("location") as string).trim();
    const bio = (form.get("bio") as string).trim() || null;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ location, bio })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleSkip() {
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <Input
        label="Your location"
        name="location"
        required
        placeholder="Charlotte, NC"
        autoFocus
      />
      <p className="text-xs text-earth-800/50 -mt-3">
        Used to connect you with nearby growers and filter the marketplace.
      </p>

      <Textarea
        label="Bio (optional)"
        name="bio"
        rows={3}
        placeholder="What do you grow? What are you looking for?"
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Saving..." : "Let's go →"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={handleSkip}
          disabled={loading}
        >
          Skip for now
        </Button>
      </div>
    </form>
  );
}
