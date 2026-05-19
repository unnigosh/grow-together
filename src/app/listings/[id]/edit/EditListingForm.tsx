"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, LISTING_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { CategoryValue, ListingTypeValue } from "@/lib/constants";
import type { Listing } from "@/lib/types/database";

interface EditListingFormProps {
  listing: Listing;
}

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingTypeValue>(
    listing.listing_type
  );
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
    const price = type === "sell" && priceRaw ? parseFloat(priceRaw) : null;

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        title,
        description,
        category,
        listing_type: type,
        price,
        location,
      })
      .eq("id", listing.id)
      .eq("user_id", listing.user_id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push(`/listings/${listing.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <Input
        label="Title"
        name="title"
        required
        maxLength={120}
        defaultValue={listing.title}
      />
      <Textarea
        label="Description"
        name="description"
        required
        rows={5}
        defaultValue={listing.description}
      />
      <Select
        label="Category"
        name="category"
        required
        options={CATEGORIES}
        defaultValue={listing.category}
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
          defaultValue={listing.price ?? ""}
        />
      )}
      <Input
        label="Location (optional)"
        name="location"
        defaultValue={listing.location ?? ""}
      />
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/listings/${listing.id}`)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
