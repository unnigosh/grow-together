import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { AddAnswerForm } from "./AddAnswerForm";
import { getQuestionCategoryEmoji, getQuestionCategoryLabel } from "@/lib/constants";
import type { QuestionWithDetails } from "@/lib/types/database";

interface QuestionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: QuestionPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select("title")
    .eq("id", id)
    .single();
  return { title: data?.title ?? "Question" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: question } = await supabase
    .from("questions")
    .select(
      `*,
      profiles!questions_user_id_fkey (id, username, full_name, avatar_url),
      answers (
        id, question_id, user_id, content, created_at,
        profiles!answers_user_id_fkey (id, username, full_name, avatar_url)
      )`
    )
    .eq("id", id)
    .single();

  if (!question) notFound();

  const typed = {
    ...question,
    answers: [...(question.answers ?? [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  } as QuestionWithDetails;

  const author = typed.profiles;
  const emoji = getQuestionCategoryEmoji(typed.category);
  const categoryLabel = getQuestionCategoryLabel(typed.category);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Back */}
      <Link href="/questions" className="text-xs text-leaf-600 hover:underline">
        ← Questions
      </Link>

      {/* Question */}
      <article className="rounded-2xl border border-earth-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Category badge */}
        <span className="inline-flex items-center gap-1 rounded-full bg-leaf-50 px-2.5 py-0.5 text-xs font-medium text-leaf-700">
          {emoji} {categoryLabel}
        </span>

        <h1 className="mt-3 text-xl font-bold text-earth-900 sm:text-2xl">
          {typed.title}
        </h1>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-earth-900">
          {typed.content}
        </p>

        {typed.photo_url && (
          <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={typed.photo_url}
              alt="Question photo"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 672px"
            />
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 border-t border-earth-100 pt-4">
          <Link href={`/profile/${author.username}`} className="shrink-0">
            <Avatar
              src={author.avatar_url}
              name={author.full_name ?? author.username}
            />
          </Link>
          <div>
            <Link
              href={`/profile/${author.username}`}
              className="text-sm font-semibold text-earth-900 hover:text-leaf-700"
            >
              {author.full_name ?? author.username}
            </Link>
            <p className="text-xs text-earth-800/50">
              Asked {formatDate(typed.created_at)}
            </p>
          </div>
        </div>
      </article>

      {/* Answers */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-earth-900">
          {typed.answers.length === 0
            ? "No answers yet"
            : `${typed.answers.length} ${typed.answers.length === 1 ? "Answer" : "Answers"}`}
        </h2>

        {typed.answers.map((answer) => {
          const answerAuthor = answer.profiles;
          return (
            <div
              key={answer.id}
              className="rounded-2xl border border-earth-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-earth-900">
                {answer.content}
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-earth-100 pt-3">
                <Link href={`/profile/${answerAuthor.username}`} className="shrink-0">
                  <Avatar
                    src={answerAuthor.avatar_url}
                    name={answerAuthor.full_name ?? answerAuthor.username}
                    size="sm"
                  />
                </Link>
                <div>
                  <Link
                    href={`/profile/${answerAuthor.username}`}
                    className="text-sm font-semibold text-earth-900 hover:text-leaf-700"
                  >
                    {answerAuthor.full_name ?? answerAuthor.username}
                  </Link>
                  <p className="text-xs text-earth-800/50">
                    {formatDate(answer.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Answer form */}
      {user ? (
        <section className="rounded-2xl border border-earth-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-bold text-earth-900">
            Write an answer
          </h2>
          <AddAnswerForm questionId={typed.id} userId={user.id} />
        </section>
      ) : (
        <div className="rounded-2xl border border-leaf-200 bg-leaf-50 px-5 py-4 text-sm text-leaf-800">
          <Link href="/login" className="font-semibold hover:underline">
            Log in
          </Link>{" "}
          to answer this question.
        </div>
      )}
    </div>
  );
}
