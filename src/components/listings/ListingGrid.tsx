import { ListingCard } from "./ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ListingWithDetails } from "@/lib/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface ListingGridProps {
  listings: ListingWithDetails[];
  emptyMessage?: string;
}

export function ListingGrid({
  listings,
  emptyMessage = "No listings found. Try adjusting your search or filters.",
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        title="Nothing growing here yet"
        description={emptyMessage}
        action={
          <Link href="/listings/new">
            <Button>Post your first listing</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
