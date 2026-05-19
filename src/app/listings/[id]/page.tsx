import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ContactSellerButton } from "@/components/listings/ContactSellerButton";
import { MarkSoldButton } from "@/components/listings/MarkSoldButton";
import { DeleteListingButton } from "@/components/listings/DeleteListingButton";
import { ListingImageGallery } from "@/components/listings/ListingImageGallery";
import { ListingGrid } from "@/components/listings/ListingGrid";
import {
  formatPrice,
  getCategoryLabel,
  getListingTypeLabel,
} from "@/lib/constants";
import type { ListingWithDetails } from "@/lib/types/database";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("title")
    .eq("id", id)
    .single();
  return { title: data?.title ?? "Listing" };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles!listings_user_id_fkey (id, username, full_name, avatar_url, bio, location),
      listing_images (id, url, sort_order)
    `
    )
    .eq("id", id)
    .single();

  if (!listing) notFound();

  const images = [...(listing.listing_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const isOwner = user?.id === listing.user_id;
  const isSold = listing.status === "sold";

  let isFavorited = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .maybeSingle();
    isFavorited = !!fav;
  }

  const { data: relatedRaw } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles!listings_user_id_fkey (id, username, full_name, avatar_url, location),
      listing_images (id, url, sort_order)
    `
    )
    .eq("category", listing.category)
    .eq("status", "active")
    .neq("id", listing.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const relatedListings = (relatedRaw ?? []).map((item) => ({
    ...item,
    listing_images: [...(item.listing_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  })) as ListingWithDetails[];

  const displayLocation =
    listing.location ?? listing.profiles?.location ?? null;

  return (
    <div className="-mx-4 space-y-10 sm:-mx-6 sm:space-y-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1 px-4 text-sm font-medium text-leaf-700 hover:underline sm:px-0"
      >
        ← Back to listings
      </Link>

      <div className="grid gap-8 px-4 sm:px-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">
        {/* Image gallery */}
        <ListingImageGallery
          images={images}
          title={listing.title}
          isSold={isSold}
        />

        {/* Details sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Title & meta */}
          <div className="rounded-2xl border border-earth-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{getCategoryLabel(listing.category)}</Badge>
              <Badge variant="category">
                {getListingTypeLabel(listing.listing_type)}
              </Badge>
              {isSold && <Badge variant="sold">Sold</Badge>}
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-earth-900 sm:text-3xl">
              {listing.title}
            </h1>

            <p className="mt-4 text-3xl font-bold text-leaf-700 sm:text-4xl">
              {formatPrice(listing.price, listing.listing_type)}
            </p>

            {displayLocation && (
              <p className="mt-3 flex items-center gap-2 text-base text-earth-800">
                <span className="text-lg" aria-hidden>
                  📍
                </span>
                <span className="font-medium">{displayLocation}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-earth-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {isOwner ? (
                <>
                  <Link href={`/listings/${listing.id}/edit`} className="sm:flex-1">
                    <Button variant="outline" fullWidth>
                      Edit Listing
                    </Button>
                  </Link>
                  <MarkSoldButton listingId={listing.id} isSold={isSold} />
                  <DeleteListingButton listingId={listing.id} />
                </>
              ) : (
                <>
                  {!isSold && (
                    <div className="sm:flex-1">
                      <ContactSellerButton
                        listingId={listing.id}
                        sellerId={listing.user_id}
                        buyerId={user?.id ?? null}
                      />
                    </div>
                  )}
                  <FavoriteButton
                    listingId={listing.id}
                    userId={user?.id ?? null}
                    initialFavorited={isFavorited}
                  />
                </>
              )}
            </div>
          </div>

          {/* Seller */}
          <Link
            href={`/profile/${listing.profiles?.username}`}
            className="flex items-center gap-4 rounded-2xl border border-earth-200/80 bg-gradient-to-br from-leaf-50/80 to-white p-5 shadow-sm transition hover:border-leaf-300 hover:shadow-md sm:p-6"
          >
            <Avatar
              src={listing.profiles?.avatar_url}
              name={listing.profiles?.full_name ?? listing.profiles?.username}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
                Seller
              </p>
              <p className="mt-0.5 truncate text-lg font-semibold text-earth-900">
                {listing.profiles?.full_name ?? listing.profiles?.username}
              </p>
              <p className="truncate text-sm text-earth-800/60">
                @{listing.profiles?.username}
              </p>
              {listing.profiles?.location && (
                <p className="mt-1 text-sm text-earth-800/70">
                  📍 {listing.profiles.location}
                </p>
              )}
            </div>
            <span className="shrink-0 text-earth-400" aria-hidden>
              →
            </span>
          </Link>

          {/* Description */}
          <div className="rounded-2xl border border-earth-200/80 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-earth-800/60">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-earth-800">
              {listing.description}
            </p>
            {listing.profiles?.bio && (
              <p className="mt-4 border-t border-earth-100 pt-4 text-sm leading-relaxed text-earth-800/70">
                <span className="font-medium text-earth-900">About the seller: </span>
                {listing.profiles.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related listings */}
      {relatedListings.length > 0 && (
        <section className="border-t border-earth-200/80 px-4 pt-10 sm:px-0 sm:pt-12">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-earth-900 sm:text-2xl">
                Related listings
              </h2>
              <p className="mt-1 text-sm text-earth-800/70">
                More in {getCategoryLabel(listing.category)}
              </p>
            </div>
            <Link
              href={`/?category=${listing.category}`}
              className="text-sm font-medium text-leaf-700 hover:underline"
            >
              View all →
            </Link>
          </div>
          <ListingGrid
            listings={relatedListings}
            emptyMessage="No related listings right now."
          />
        </section>
      )}
    </div>
  );
}
