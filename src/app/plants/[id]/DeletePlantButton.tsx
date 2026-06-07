"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface DeletePlantButtonProps {
  plantId: string;
}

export function DeletePlantButton({ plantId }: DeletePlantButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await supabase.from("plants").delete().eq("id", plantId);
    router.push("/plants");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-earth-800">Delete this plant?</span>
        <Button size="sm" variant="danger" onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting..." : "Yes, delete"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}
