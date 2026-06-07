import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { getQuestionCategoryEmoji, getQuestionCategoryLabel } from "@/lib/constants";
import type { QuestionWithAuthor } from "@/lib/types/database";

interface QuestionCardProps {
  question: QuestionWithAuthor;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function QuestionCard({ question }: QuestionCardProps) {
  const author = question.profiles;
  const answerCount = question.answers?.[0]?.count ?? 0;
  const emoji = getQuestionCategoryEmoji(question.category);
  const categoryLabel = getQuestionCategoryLabel(question.category);

  return (
    <Link
      href={`/questions/${question.id}`}
      className="group flex gap-4 rounded-2xl border border-earth-200 bg-white p-4 shadow-sm transition hover:border-leaf-300 hover:shadow-md sm:p-5"
    >
      {/* Answer count column */}
      <div className="flex w-12 shrink-0 flex-col items-center justify-start gap-0.5 pt-0.5">
        <span className="text-lg font-bold text-leaf-700">{answerCount}</span>
        <span className="text-center text-[10px] leading-tight text-earth-800/50">
          {answerCount === 1 ? "answer" : "answers"}
        </span>
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-leaf-50 px-2.5 py-0.5 text-xs font-medium text-leaf-700">
            {emoji} {categoryLabel}
          </span>
          <span className="text-xs text-earth-800/40">{formatDate(question.created_at)}</span>
        </div>

        <h3 className="mt-2 font-semibold text-earth-900 group-hover:text-leaf-700 line-clamp-2">
          {question.title}
        </h3>

        <p className="mt-1 text-sm text-earth-800/70 line-clamp-2">
          {question.content}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Avatar
            src={author.avatar_url}
            name={author.full_name ?? author.username}
            size="sm"
          />
          <span className="text-xs text-earth-800/60">
            {author.full_name ?? author.username}
          </span>
        </div>
      </div>
    </Link>
  );
}
