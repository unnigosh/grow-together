import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { MarkReadRefresher } from "./MarkReadRefresher";
import type { NotificationWithDetails } from "@/lib/types/database";

export const metadata: Metadata = { title: "Notifications" };

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/notifications");

  // Fetch notifications with actor + question details
  const { data: notifications } = await supabase
    .from("notifications")
    .select(
      `*,
      actor:profiles!notifications_actor_id_fkey (id, username, full_name, avatar_url),
      questions (id, title)`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const typed = (notifications ?? []) as NotificationWithDetails[];

  // Mark all unread as read
  const unreadIds = typed.filter((n) => !n.read_at).map((n) => n.id);
  if (unreadIds.length > 0) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <MarkReadRefresher hasUnread={unreadIds.length > 0} />
      <div>
        <h1 className="text-2xl font-bold text-earth-900">Notifications</h1>
        <p className="mt-0.5 text-sm text-earth-800/50">
          Activity on your questions
        </p>
      </div>

      {typed.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-earth-200 bg-white px-6 py-16 text-center">
          <p className="text-4xl">🔔</p>
          <p className="mt-4 font-semibold text-earth-900">No notifications yet</p>
          <p className="mt-1.5 text-sm text-earth-800/60">
            When someone answers one of your questions, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-earth-200 bg-white shadow-sm divide-y divide-earth-100">
          {typed.map((notif) => {
            const isUnread = !notif.read_at;
            const actor = notif.actor;
            const question = notif.questions;

            return (
              <li key={notif.id}>
                <Link
                  href={question ? `/questions/${notif.question_id}` : "/questions"}
                  className={`flex items-start gap-4 px-4 py-4 transition hover:bg-leaf-50 sm:px-5 ${
                    isUnread ? "bg-leaf-50/60" : ""
                  }`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 shrink-0">
                    {isUnread ? (
                      <span className="block h-2 w-2 rounded-full bg-leaf-500" />
                    ) : (
                      <span className="block h-2 w-2 rounded-full bg-transparent" />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="shrink-0">
                    <Avatar
                      src={actor.avatar_url}
                      name={actor.full_name ?? actor.username}
                    />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-earth-900">
                      <span className="font-semibold">
                        {actor.full_name ?? actor.username}
                      </span>{" "}
                      answered your question
                    </p>
                    {question && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-earth-800/60">
                        {question.title}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-earth-800/40">
                      {formatDate(notif.created_at)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
