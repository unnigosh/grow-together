import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddPlantForm } from "./AddPlantForm";

export const metadata = { title: "Add Plant" };

export default async function AddPlantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-earth-900">Add a plant</h1>
      <p className="mt-1 text-sm text-earth-800/60">
        Start tracking a plant in your collection.
      </p>
      <AddPlantForm userId={user.id} />
    </div>
  );
}
