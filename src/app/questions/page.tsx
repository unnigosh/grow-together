import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { QuestionCategoryFilter } from "@/components/questions/QuestionCategoryFilter";
import type { QuestionWithAuthor } from "@/lib/types/database";

export const metadata: Metadata = { title: "Questions" };

interface QuestionsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("questions")
    .select(
      `*,
      profiles!questions_user_id_fkey (id, username, full_name, avatar_url),
      answers(count)`
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (category) {
    query = query.eq("category", category);
  }

  const { data: questions } = await query;
  const typedQuestions = (questions ?? []) as QuestionWithAuthor[];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">Questions</h1>
          <p className="mt-0.5 text-sm text-earth-800/60">
            Ask the community for plant help and advice
          </p>
        </div>
        {user && (
          <Link href="/questions/new">
            <Button size="sm">+ Ask</Button>
          </Link>
        )}
      </div>

      <Suspense fallback={<div className="h-10 animate-pulse rounded-full bg-earth-100" />}>
        <QuestionCategoryFilter />
      </Suspense>

      {typedQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-earth-200 py-16 text-center">
          <p className="text-4xl">🌿</p>
          <p className="mt-3 font-medium text-earth-900">No questions yet</p>
          <p className="mt-1 text-sm text-earth-800/60">
            {category
              ? "No questions in this category yet."
              : "Be the first to ask the community something."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {typedQuestions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
