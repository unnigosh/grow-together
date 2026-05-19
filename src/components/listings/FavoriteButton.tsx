"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface FavoriteButtonProps {
  listingId: string;
  userId: string | null;
  initialFavorited: boolean;
}

export function FavoriteButton({
  listingId,
  userId,
  initialFavorited,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function toggle() {
    if (!userId) {
      window.location.href = `/login?redirect=/listings/${listingId}`;
      return;
    }

    setLoading(true);
    if (favorited) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listingId);
      setFavorited(false);
    } else {
      await supabase.from("favorites").insert({
        user_id: userId,
        listing_id: listingId,
      });
      setFavorited(true);
    }
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant={favorited ? "secondary" : "outline"}
      onClick={toggle}
      disabled={loading}
      aria-pressed={favorited}
    >
      {favorited ? "♥ Saved" : "♡ Save"}
    </Button>
  );
}
