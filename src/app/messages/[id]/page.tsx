import type { Metadata } from "next";
import Link from "next/link";
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
      listings (id, title)
    `
    )
    .eq("id", id)
    .single();

  if (!conversation) notFound();

  const isParticipant =
    conversation.buyer_id === user.id ||
    conversation.seller_id === user.id;
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

  return (
    <div className="space-y-4">
      <Link
        href="/messages"
        className="inline-flex text-sm text-leaf-700 hover:underline"
      >
        ← Back to messages
      </Link>
      <p className="text-sm text-earth-800/60">
        Re: <span className="font-medium">{conversation.listings?.title}</span>
      </p>
      <MessageThread
        conversationId={id}
        currentUserId={user.id}
        initialMessages={messages ?? []}
        otherUser={otherUser!}
      />
    </div>
  );
}
