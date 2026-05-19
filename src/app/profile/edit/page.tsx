import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "./EditProfileForm";

export const metadata: Metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile/edit");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/");

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/profile/${profile.username}`}
        className="inline-flex text-sm text-leaf-700 hover:underline"
      >
        ← Back to profile
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-earth-900">Edit profile</h1>
      <p className="mt-1 text-sm text-earth-800/70">
        Update your photo, bio, and how neighbors find you on GrowTogether.
      </p>
      <EditProfileForm profile={profile} />
    </div>
  );
}
