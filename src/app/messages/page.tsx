import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";

export const metadata: Metadata = { title: "Messages" };

function formatTime(date: string) {
  return new Date(date).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/messages");

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      *,
      listings (
        id,
        title,
        price,
        listing_images (url, sort_order)
      ),
      buyer:profiles!buyer_id (id, username, full_name, avatar_url),
      seller:profiles!seller_id (id, username, full_name, avatar_url),
      messages (id, content, sender_id, created_at, read_at)
    `
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (!conversations?.length) {
    return (
      <EmptyState
        title="No messages yet"
        description="When you contact a seller, your conversations will appear here."
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-earth-900">Messages</h1>
        <p className="mt-1 text-sm text-earth-800/60">
          Chat with buyers and sellers about plants, cuttings, and produce.
        </p>
      </div>

      <ul className="overflow-hidden rounded-3xl border border-earth-200 bg-white shadow-sm">
        {conversations.map((conv) => {
          const other = conv.buyer_id === user.id ? conv.seller : conv.buyer;
          const images = [...(conv.listings?.listing_images ?? [])].sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
          );
          const thumb = images[0]?.url;
          const messages = [...(conv.messages ?? [])].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          const lastMessage = messages[messages.length - 1];
          const hasUnread = messages.some(
            (msg) => msg.sender_id !== user.id && !msg.read_at
          );

          return (
            <li key={conv.id}>
              <Link
                href={`/messages/${conv.id}`}
                className="flex gap-4 px-4 py-4 transition hover:bg-leaf-50 sm:px-5"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-leaf-50">
                  {thumb ? (
                    <Image src={thumb} alt="" fill className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-3xl">
                      🪴
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate font-semibold text-earth-900">
                      {conv.listings?.title ?? "Listing"}
                    </p>
                    {lastMessage && (
                      <span className="shrink-0 text-xs text-earth-800/50">
                        {formatTime(lastMessage.created_at)}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <Avatar
                      src={other?.avatar_url}
                      name={other?.full_name ?? other?.username}
                      size="sm"
                    />
                    <span className="truncate text-sm text-earth-800/70">
                      {other?.full_name ?? other?.username}
                    </span>
                    {hasUnread && (
                      <span className="rounded-full bg-leaf-600 px-2 py-0.5 text-xs font-medium text-white">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-1 text-sm text-earth-800/60">
                    {lastMessage?.content ?? "No messages yet."}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}