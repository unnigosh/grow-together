import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { WelcomeForm } from "./WelcomeForm";

export const metadata: Metadata = { title: "Welcome to GrowTogether" };

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Must be logged in
  if (!user) redirect("/signup");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, location")
    .eq("id", user.id)
    .single();

  // If they already have a location they've done onboarding — send to feed
  if (profile?.location) redirect("/");

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-earth-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-4xl">🌿</p>
          <h1 className="mt-3 text-2xl font-bold text-earth-900">
            Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-2 text-sm text-earth-800/60">
            Tell us a little about yourself so we can connect you with
            growers in your area.
          </p>
        </div>

        {/* Progress dots */}
        <div className="mt-6 flex justify-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-earth-200" />
          <span className="h-2 w-5 rounded-full bg-leaf-600" />
          <span className="h-2 w-2 rounded-full bg-earth-200" />
        </div>

        <WelcomeForm userId={user.id} fullName={profile?.full_name ?? null} />
      </div>

      {/* What you can do next */}
      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[
          { emoji: "🛒", label: "Browse the marketplace" },
          { emoji: "💬", label: "Ask plant questions" },
          { emoji: "🪴", label: "Track your plants" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-earth-200 bg-white px-2 py-4 shadow-sm"
          >
            <p className="text-2xl">{item.emoji}</p>
            <p className="mt-1 text-xs text-earth-800/60">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
