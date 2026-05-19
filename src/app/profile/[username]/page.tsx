import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { ProfileStats } from "@/components/profile/ProfileStats";
import type { ListingWithDetails } from "@/lib/types/database";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("username", username)
    .single();

  return {
    title: profile?.full_name ?? `@${username}`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const isOwnProfile = user?.id === profile.id;

  const { data: listings } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles!listings_user_id_fkey (id, username, full_name, avatar_url, location),
      listing_images (id, url, sort_order)
    `
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const allListings = (listings ?? []).map((listing) => ({
    ...listing,
    listing_images: [...(listing.listing_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  })) as ListingWithDetails[];

  const activeCount = allListings.filter((l) => l.status === "active").length;
  const soldCount = allListings.filter((l) => l.status === "sold").length;

  return (
    <div className="-mx-4 space-y-8 sm:-mx-6 sm:space-y-10">
      {/* Hero */}
      <div className="overflow-hidden rounded-none border-b border-leaf-200/60 bg-gradient-to-br from-leaf-600 via-leaf-700 to-leaf-800 sm:rounded-3xl sm:border sm:shadow-md">
        <div className="px-4 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <div className="shrink-0">
                <Avatar
                  src={profile.avatar_url}
                  name={profile.full_name ?? profile.username}
                  size="xl"
                  className="ring-4 ring-white/90 shadow-lg"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  {profile.full_name ?? profile.username}
                </h1>
                <p className="mt-1 text-leaf-100">@{profile.username}</p>
                {profile.location && (
                  <p className="mt-2 text-sm text-leaf-100/90">
                    📍 {profile.location}
                  </p>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <Link href="/profile/edit" className="shrink-0">
                <Button
                  variant="secondary"
                  className="bg-white/95 text-leaf-800 hover:bg-white"
                >
                  Edit profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8 px-4 sm:px-0">
        <ProfileStats
          activeCount={activeCount}
          soldCount={soldCount}
          joinDate={profile.created_at}
        />

        {profile.bio && (
          <div className="rounded-2xl border border-earth-200/80 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-earth-800/60">
              About
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-earth-800">
              {profile.bio}
            </p>
          </div>
        )}

        <section>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-earth-900 sm:text-2xl">
                {isOwnProfile ? "Your listings" : "Listings"}
              </h2>
              <p className="mt-1 text-sm text-earth-800/70">
                {allListings.length === 0
                  ? "No listings posted yet"
                  : `${allListings.length} total · ${activeCount} active · ${soldCount} sold`}
              </p>
            </div>
            {isOwnProfile && (
              <Link href="/listings/new">
                <Button size="sm">+ Post a listing</Button>
              </Link>
            )}
          </div>
          <ListingGrid
            listings={allListings}
            emptyMessage={
              isOwnProfile
                ? "You haven't posted any listings yet. Share what you're growing!"
                : "This gardener hasn't posted any listings yet."
            }
          />
        </section>
      </div>
    </div>
  );
}
