import Link from "next/link";
import { PostCard } from "./PostCard";
import type { PostWithAuthor } from "@/lib/types/database";

interface PostFeedProps {
  posts: PostWithAuthor[];
  currentUserId?: string | null;
}

export function PostFeed({ posts, currentUserId }: PostFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-earth-200 bg-white px-6 py-16 text-center">
        <p className="text-5xl">🌱</p>
        <p className="mt-4 text-base font-semibold text-earth-900">
          The feed is empty
        </p>
        <p className="mt-1.5 text-sm text-earth-800/60">
          Be the first to share something — a harvest, a tip, or what you&apos;re growing.
        </p>
        <Link
          href="/feed/new"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
        >
          + Create a post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
