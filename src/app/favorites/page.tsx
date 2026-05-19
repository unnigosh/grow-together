import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingGrid } from "@/components/listings/ListingGrid";
import type { ListingWithDetails } from "@/lib/types/database";

export const metadata: Metadata = { title: "Saved listings" };

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/favorites");

  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      `
      listing_id,
      listings (
        *,
        profiles!listings_user_id_fkey (id, username, full_name, avatar_url, location),
        listing_images (id, url, sort_order)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

    const listings = ((favorites ?? []) as unknown as { listings: ListingWithDetails }[])
    .map((f) => f.listings)
    .filter(Boolean)
    .map((listing) => ({
      ...listing!,
      listing_images: [...(listing!.listing_images ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order
      ),
    })) as ListingWithDetails[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-earth-900">Saved listings</h1>
      <ListingGrid
        listings={listings}
        emptyMessage="You haven't saved any listings yet. Tap ♡ on a listing to save it."
      />
    </div>
  );
}
