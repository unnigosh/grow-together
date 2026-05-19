import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditListingForm } from "./EditListingForm";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/listings/${id}/edit`);

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) notFound();

  if (listing.user_id !== user.id) {
    redirect(`/listings/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={`/listings/${id}`}
        className="inline-flex text-sm text-leaf-700 hover:underline"
      >
        ← Back to listing
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-earth-900">Edit listing</h1>
      <p className="mt-1 text-sm text-earth-800/70">
        Update your listing details below.
      </p>
      <EditListingForm listing={listing} />
    </div>
  );
}
