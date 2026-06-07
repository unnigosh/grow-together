import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { PostWithAuthor } from "@/lib/types/database";

interface PostCardProps {
  post: PostWithAuthor;
}

function formatPostDate(iso: string) {
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

export function PostCard({ post }: PostCardProps) {
  const author = post.profiles;

  return (
    <article className="rounded-2xl border border-earth-200 bg-white shadow-sm">
      {/* Author row */}
      <div className="flex items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <Link href={`/profile/${author.username}`} className="shrink-0">
          <Avatar
            src={author.avatar_url}
            name={author.full_name ?? author.username}
          />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/profile/${author.username}`}
            className="font-semibold text-earth-900 hover:text-leaf-700"
          >
            {author.full_name ?? author.username}
          </Link>
          <p className="text-xs text-earth-800/50">
            @{author.username} · {formatPostDate(post.created_at)}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 whitespace-pre-wrap px-4 text-sm leading-relaxed text-earth-900 sm:px-5">
        {post.content}
      </p>

      {/* Photo */}
      {post.photo_url && (
        <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-b-2xl sm:mx-5 sm:w-[calc(100%-2.5rem)] sm:rounded-2xl">
          <Image
            src={post.photo_url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 680px"
          />
        </div>
      )}

      {!post.photo_url && <div className="pb-4 sm:pb-5" />}
    </article>
  );
}
