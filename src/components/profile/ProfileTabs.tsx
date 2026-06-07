"use client";

import { useRouter } from "next/navigation";
import { PostCard } from "@/components/feed/PostCard";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { PlantGrid } from "@/components/plants/PlantGrid";
import type {
  PostWithAuthor,
  QuestionWithAuthor,
  ListingWithDetails,
  PlantWithImages,
} from "@/lib/types/database";

type Tab = "posts" | "questions" | "listings" | "plants";

interface ProfileTabsProps {
  username: string;
  activeTab: Tab;
  isOwnProfile: boolean;
  posts: PostWithAuthor[];
  questions: QuestionWithAuthor[];
  listings: ListingWithDetails[];
  plants: PlantWithImages[];
}

const TABS: { id: Tab; label: string }[] = [
  { id: "posts",     label: "Posts"     },
  { id: "questions", label: "Questions" },
  { id: "listings",  label: "Listings"  },
  { id: "plants",    label: "Plants"    },
];

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-earth-200 py-14 text-center">
      <p className="text-3xl">🌱</p>
      <p className="mt-3 text-sm text-earth-800/60">{message}</p>
    </div>
  );
}

export function ProfileTabs({
  username,
  activeTab,
  isOwnProfile,
  posts,
  questions,
  listings,
  plants,
}: ProfileTabsProps) {
  const router = useRouter();

  const visibleTabs = isOwnProfile
    ? TABS
    : TABS.filter((t) => t.id !== "plants");

  function setTab(tab: Tab) {
    router.push(`/profile/${username}?tab=${tab}`);
  }

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-earth-200">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "text-leaf-700"
                  : "text-earth-800/60 hover:text-earth-900"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-leaf-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <EmptyTab
              message={
                isOwnProfile
                  ? "You haven't posted anything yet."
                  : "No posts yet."
              }
            />
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {activeTab === "questions" && (
        <div className="space-y-3">
          {questions.length === 0 ? (
            <EmptyTab
              message={
                isOwnProfile
                  ? "You haven't asked any questions yet."
                  : "No questions yet."
              }
            />
          ) : (
            questions.map((q) => <QuestionCard key={q.id} question={q} />)
          )}
        </div>
      )}

      {activeTab === "listings" && (
        <ListingGrid
          listings={listings}
          emptyMessage={
            isOwnProfile
              ? "You haven't posted any listings yet. Share what you're growing!"
              : "No listings yet."
          }
        />
      )}

      {activeTab === "plants" && isOwnProfile && (
        <PlantGrid plants={plants} />
      )}
    </div>
  );
}
