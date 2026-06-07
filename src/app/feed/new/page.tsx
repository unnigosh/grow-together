import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CreatePostForm } from "./CreatePostForm";

export const metadata: Metadata = { title: "New Post" };

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/feed/new");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-earth-900">Create a post</h1>
      <p className="mt-1 text-sm text-earth-800/60">
        Share a photo, tip, harvest, or update with the community.
      </p>
      <CreatePostForm userId={user.id} />
    </div>
  );
}
