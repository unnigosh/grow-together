"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface MarkSoldButtonProps {
  listingId: string;
  isSold: boolean;
}

export function MarkSoldButton({ listingId, isSold }: MarkSoldButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function toggleSold() {
    setLoading(true);
    const newStatus = isSold ? "active" : "sold";
    await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", listingId);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant={isSold ? "outline" : "secondary"}
      onClick={toggleSold}
      disabled={loading}
    >
      {isSold ? "Mark as available" : "Mark as sold"}
    </Button>
  );
}
