import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageThread } from "@/components/messages/MessageThread";

interface MessagePageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: MessagePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/messages/${id}`);

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      `
      *,
      buyer:profiles!buyer_id (id, username, full_name, avatar_url),
      seller:profiles!seller_id (id, username, full_name, avatar_url),
      listings (
        id,
        title,
        price,
        location,
        listing_images (url, sort_order)
      )
    `
    )
    .eq("id", id)
    .single();

  if (!conversation) notFound();

  const isParticipant =
    conversation.buyer_id === user.id || conversation.seller_id === user.id;

  if (!isParticipant) notFound();

  const otherUser =
    conversation.buyer_id === user.id
      ? conversation.seller
      : conversation.buyer;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const images = [...(conversation.listings?.listing_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const listingImage = images[0]?.url;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        href="/messages"
        className="inline-flex text-sm font-medium text-leaf-700 hover:underline"
      >
        ← Back to messages
      </Link>

      <div className="flex items-center gap-3 rounded-2xl border border-earth-200 bg-white p-3 shadow-sm">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-leaf-50">
          {listingImage ? (
            <Image src={listingImage} alt="" fill className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-2xl">
              🪴
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm text-earth-800/60">
            Conversation about
          </p>
          <Link
            href={`/listings/${conversation.listings?.id}`}
            className="truncate font-semibold text-earth-900 hover:text-leaf-700"
          >
            {conversation.listings?.title}
          </Link>
          <p className="text-sm text-earth-800/60">
            {conversation.listings?.price != null
              ? `$${conversation.listings.price}`
              : "Trade / Free"}{" "}
            {conversation.listings?.location
              ? `• ${conversation.listings.location}`
              : ""}
          </p>
        </div>
      </div>

      <MessageThread
        conversationId={id}
        currentUserId={user.id}
        initialMessages={messages ?? []}
        otherUser={otherUser!}
      />
    </div>
  );
}