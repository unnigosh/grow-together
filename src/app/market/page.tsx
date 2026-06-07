import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { SearchBar } from "@/components/listings/SearchBar";
import { CategoryFilter } from "@/components/listings/CategoryFilter";
import type { ListingWithDetails } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "Marketplace",
};

interface MarketPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function MarketPage({ searchParams }: MarketPageProps) {
  const { q, category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(
      `
      *,
      profiles!listings_user_id_fkey (id, username, full_name, avatar_url, location),
      listing_images (id, url, sort_order)
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (q?.trim()) {
    query = query.textSearch("search_vector", q.trim(), {
      type: "websearch",
      config: "english",
    });
  }

  const { data: listings } = await query;

  const sorted = (listings ?? []).map((listing) => ({
    ...listing,
    listing_images: [...(listing.listing_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  })) as ListingWithDetails[];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-leaf-600 to-leaf-800 px-6 py-10 text-white sm:px-10">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Plant Marketplace
        </h1>
        <p className="mt-2 max-w-xl text-leaf-100">
          Buy, sell, and trade plants, cuttings, seeds, herbs, and homegrown
          produce with your community.
        </p>
      </section>

      <Suspense fallback={<div className="h-11 animate-pulse rounded-xl bg-earth-100" />}>
        <SearchBar />
      </Suspense>

      <Suspense fallback={<div className="h-10 animate-pulse rounded-full bg-earth-100" />}>
        <CategoryFilter />
      </Suspense>

      <ListingGrid
        listings={sorted}
        emptyMessage={
          q || category
            ? "No listings match your search. Try different keywords or categories."
            : undefined
        }
      />
    </div>
  );
}
