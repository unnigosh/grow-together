import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, getCategoryLabel } from "@/lib/constants";
import type { ListingWithDetails } from "@/lib/types/database";

interface ListingCardProps {
  listing: ListingWithDetails;
}

export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.listing_images?.[0]?.url;
  const isSold = listing.status === "sold";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-earth-200 bg-white shadow-sm transition hover:border-leaf-300 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-leaf-50">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🪴</div>
        )}
        <div className="absolute left-2 top-2">
          <Badge variant="category">{getCategoryLabel(listing.category)}</Badge>
        </div>
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Badge variant="sold">Sold</Badge>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-lg font-bold text-leaf-700">
          {formatPrice(listing.price, listing.listing_type)}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium text-earth-900 group-hover:text-leaf-700">
          {listing.title}
        </h3>
        {(listing.location || listing.profiles?.location) && (
          <p className="mt-1 truncate text-xs text-earth-800/60">
            📍 {listing.location ?? listing.profiles?.location}
          </p>
        )}
      </div>
    </Link>
  );
}
