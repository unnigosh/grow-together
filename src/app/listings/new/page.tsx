import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateListingForm } from "./CreateListingForm";

export const metadata: Metadata = { title: "Create listing" };

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/listings/new");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-earth-900">Create a listing</h1>
      <p className="mt-1 text-sm text-earth-800/70">
        Share what you&apos;re growing with your local community.
      </p>
      <CreateListingForm userId={user.id} />
    </div>
  );
}
