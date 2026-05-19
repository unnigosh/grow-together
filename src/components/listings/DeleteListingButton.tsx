"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface DeleteListingButtonProps {
  listingId: string;
}

export function DeleteListingButton({ listingId }: DeleteListingButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleDelete() {
    setError(null);
    setLoading(true);

    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <p className="text-sm text-earth-800">
          Delete this listing? This cannot be undone.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, delete"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="danger"
      onClick={() => setConfirming(true)}
    >
      Delete Listing
    </Button>
  );
}
