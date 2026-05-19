import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";

export const metadata: Metadata = { title: "Messages" };

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
      listings (id, title, listing_images (url)),
      buyer:profiles!buyer_id (id, username, full_name, avatar_url),
      seller:profiles!seller_id (id, username, full_name, avatar_url)
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-earth-900">Messages</h1>
      <ul className="divide-y divide-earth-100 rounded-2xl border border-earth-200 bg-white">
        {conversations.map((conv) => {
          const other =
            conv.buyer_id === user.id ? conv.seller : conv.buyer;
          const thumb = conv.listings?.listing_images?.[0]?.url;

          return (
            <li key={conv.id}>
              <Link
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 px-4 py-4 hover:bg-leaf-50"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-leaf-50">
                  {thumb ? (
                    <Image src={thumb} alt="" fill className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-2xl">
                      🪴
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-earth-900">
                    {conv.listings?.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Avatar
                      src={other?.avatar_url}
                      name={other?.full_name ?? other?.username}
                      size="sm"
                    />
                    <span className="truncate text-sm text-earth-800/60">
                      {other?.full_name ?? other?.username}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
