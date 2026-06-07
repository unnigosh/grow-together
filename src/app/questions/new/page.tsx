import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CreateQuestionForm } from "./CreateQuestionForm";

export const metadata: Metadata = { title: "Ask a Question" };

export default async function NewQuestionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/questions/new");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-earth-900">Ask the community</h1>
      <p className="mt-1 text-sm text-earth-800/60">
        Share what you&apos;re seeing and get help from other growers.
      </p>
      <CreateQuestionForm userId={user.id} />
    </div>
  );
}
