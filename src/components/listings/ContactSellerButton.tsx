"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface ContactSellerButtonProps {
  listingId: string;
  sellerId: string;
  buyerId: string | null;
}

export function ContactSellerButton({
  listingId,
  sellerId,
  buyerId,
}: ContactSellerButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function startConversation() {
    if (!buyerId) {
      router.push(`/login?redirect=/listings/${listingId}`);
      return;
    }

    if (buyerId === sellerId) return;

    setLoading(true);

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listingId)
      .eq("buyer_id", buyerId)
      .maybeSingle();

    if (existing) {
      router.push(`/messages/${existing.id}`);
      setLoading(false);
      return;
    }

    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: sellerId,
      })
      .select("id")
      .single();

    if (error) {
      setLoading(false);
      return;
    }

    router.push(`/messages/${created.id}`);
    setLoading(false);
  }

  return (
    <Button onClick={startConversation} disabled={loading} fullWidth>
      Message seller
    </Button>
  );
}
