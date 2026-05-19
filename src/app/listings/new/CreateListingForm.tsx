"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, LISTING_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ImageUpload } from "@/components/listings/ImageUpload";
import type { CategoryValue, ListingTypeValue } from "@/lib/constants";

interface CreateListingFormProps {
  userId: string;
}

export function CreateListingForm({ userId }: CreateListingFormProps) {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [listingType, setListingType] = useState<ListingTypeValue>("sell");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const description = form.get("description") as string;
    const category = form.get("category") as CategoryValue;
    const location = (form.get("location") as string) || null;
    const type = form.get("listing_type") as ListingTypeValue;
    const priceRaw = form.get("price") as string;
    const price =
      type === "sell" && priceRaw ? parseFloat(priceRaw) : null;

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        user_id: userId,
        title,
        description,
        category,
        listing_type: type,
        price,
        location,
      })
      .select("id")
      .single();

    if (listingError || !listing) {
      setError(listingError?.message ?? "Failed to create listing");
      setLoading(false);
      return;
    }

    if (imageUrls.length > 0) {
      await supabase.from("listing_images").insert(
        imageUrls.map((url, i) => ({
          listing_id: listing.id,
          url,
          sort_order: i,
        }))
      );
    }

    router.push(`/listings/${listing.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <Input label="Title" name="title" required maxLength={120} placeholder="Monstera cutting — healthy & rooted" />
      <Textarea
        label="Description"
        name="description"
        required
        rows={5}
        placeholder="Tell neighbors about condition, size, pickup options..."
      />
      <Select
        label="Category"
        name="category"
        required
        options={CATEGORIES}
        defaultValue={CATEGORIES[0].value}
      />
      <Select
        label="Listing type"
        name="listing_type"
        required
        options={LISTING_TYPES}
        value={listingType}
        onChange={(e) => setListingType(e.target.value as ListingTypeValue)}
      />
      {listingType === "sell" && (
        <Input
          label="Price ($)"
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="15"
        />
      )}
      <Input label="Location (optional)" name="location" placeholder="Raleigh, NC" />
      <div>
        <p className="mb-2 text-sm font-medium text-earth-800">Photos</p>
        <ImageUpload userId={userId} onImagesChange={setImageUrls} />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Posting..." : "Post listing"}
      </Button>
    </form>
  );
}
