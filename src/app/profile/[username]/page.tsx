import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import type {
  ListingWithDetails,
  PostWithAuthor,
  QuestionWithAuthor,
  PlantWithImages,
} from "@/lib/types/database";

type Tab = "posts" | "questions" | "listings" | "plants";
const VALID_TABS: Tab[] = ["posts", "questions", "listings", "plants"];

interface ProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
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
  return { title: profile?.full_name ?? `@${username}` };
}

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const { username } = await params;
  const { tab: tabParam } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const isOwnProfile = user?.id === profile.id;

  // Resolve active tab — default to "posts", ignore "plants" for other users
  const rawTab = VALID_TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "posts";
  const activeTab: Tab = rawTab === "plants" && !isOwnProfile ? "posts" : rawTab;

  // Fetch all data in parallel
  const [postsResult, questionsResult, listingsResult, plantsResult] =
    await Promise.all([
      supabase
        .from("posts")
        .select("*, profiles!posts_user_id_fkey (id, username, full_name, avatar_url)")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("questions")
        .select(
          "*, profiles!questions_user_id_fkey (id, username, full_name, avatar_url), answers(count)"
        )
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("listings")
        .select(
          "*, profiles!listings_user_id_fkey (id, username, full_name, avatar_url, location), listing_images (id, url, sort_order)"
        )
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false }),

      isOwnProfile
        ? supabase
            .from("plants")
            .select("*, plant_images(id, url, sort_order)")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: null }),
    ]);

  const posts = (postsResult.data ?? []) as PostWithAuthor[];

  const questions = (questionsResult.data ?? []) as QuestionWithAuthor[];

  const listings = (listingsResult.data ?? []).map((l) => ({
    ...l,
    listing_images: [...(l.listing_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  })) as ListingWithDetails[];

  const plants = (plantsResult.data ?? []).map((p) => ({
    ...p,
    plant_images: [...(p.plant_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  })) as PlantWithImages[];

  return (
    <div className="-mx-4 space-y-6 sm:-mx-6">
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

      {/* Body */}
      <div className="space-y-6 px-4 sm:px-0">
        <ProfileStats
          postCount={posts.length}
          questionCount={questions.length}
          listingCount={listings.length}
          plantCount={isOwnProfile ? plants.length : null}
          joinDate={profile.created_at}
        />

        {profile.bio && (
          <div className="rounded-2xl border border-earth-200/80 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-earth-800/50">
              About
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-earth-800">
              {profile.bio}
            </p>
          </div>
        )}

        <ProfileTabs
          username={profile.username}
          activeTab={activeTab}
          currentUserId={user?.id ?? null}
          isOwnProfile={isOwnProfile}
          posts={posts}
          questions={questions}
          listings={listings}
          plants={plants}
        />
      </div>
    </div>
  );
}
