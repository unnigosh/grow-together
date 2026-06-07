import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { PostFeed } from "@/components/feed/PostFeed";
import type { PostWithAuthor } from "@/lib/types/database";

export const metadata: Metadata = {
  title: { absolute: "GrowTogether — Plant Community" },
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
      {/* Welcome banner for logged-out visitors */}
      {!user && (
        <div className="rounded-2xl bg-gradient-to-br from-leaf-600 to-leaf-800 px-6 py-8 text-white">
          <h1 className="text-xl font-bold sm:text-2xl">Welcome to GrowTogether 🌿</h1>
          <p className="mt-1.5 text-sm text-leaf-100">
            A community for plant lovers — share what you grow, ask questions, and find plants near you.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/signup">
              <Button size="sm" className="bg-white text-leaf-700 hover:bg-leaf-50">
                Join free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Feed header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-earth-900">
            {user ? "Community Feed" : "Recent posts"}
          </h1>
          <p className="mt-0.5 text-sm text-earth-800/50">
            What the community is growing and sharing
          </p>
        </div>
        {user && (
          <Link href="/feed/new">
            <Button size="sm">+ Post</Button>
          </Link>
        )}
      </div>

      <PostFeed posts={typedPosts} />
    </div>
  );
}
