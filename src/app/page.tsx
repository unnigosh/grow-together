import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { PostFeed } from "@/components/feed/PostFeed";
import type { PostWithAuthor } from "@/lib/types/database";

export const metadata: Metadata = {
  title: {
    absolute: "GrowTogether — Plant Community",
  },
};

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles!posts_user_id_fkey (id, username, full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(50);

  const typedPosts = (posts ?? []) as PostWithAuthor[];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Community Feed</h1>
          <p className="mt-0.5 text-sm text-earth-800/60">
            What the community is growing and sharing
          </p>
        </div>
        {user && (
          <Link href="/feed/new">
            <Button size="sm">+ Post</Button>
          </Link>
        )}
      </div>

      {/* Prompt for logged-out visitors */}
      {!user && (
        <div className="rounded-2xl border border-leaf-200 bg-leaf-50 px-5 py-4 text-sm text-leaf-800">
          <Link href="/signup" className="font-semibold hover:underline">
            Join GrowTogether
          </Link>{" "}
          to share posts with your plant community.
        </div>
      )}

      <PostFeed posts={typedPosts} />
    </div>
  );
}
