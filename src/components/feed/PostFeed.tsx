import { PostCard } from "./PostCard";
import type { PostWithAuthor } from "@/lib/types/database";

interface PostFeedProps {
  posts: PostWithAuthor[];
}

export function PostFeed({ posts }: PostFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-earth-200 py-16 text-center">
        <p className="text-4xl">🌱</p>
        <p className="mt-3 font-medium text-earth-900">Nothing here yet</p>
        <p className="mt-1 text-sm text-earth-800/60">
          Be the first to share something with the community.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
