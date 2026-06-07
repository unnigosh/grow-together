import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { PlantGrid } from "@/components/plants/PlantGrid";
import type { PlantWithImages } from "@/lib/types/database";

export const metadata = { title: "My Plants" };

export default async function PlantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: plants } = await supabase
    .from("plants")
    .select("*, plant_images(id, url, sort_order)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const sorted = (plants ?? []).map((p) => ({
    ...p,
    plant_images: [...(p.plant_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  })) as PlantWithImages[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">My Plants</h1>
          <p className="mt-1 text-sm text-earth-800/60">
            {sorted.length === 0
              ? "Your plant collection lives here."
              : `${sorted.length} plant${sorted.length === 1 ? "" : "s"} in your collection`}
          </p>
        </div>
        <Link href="/plants/new">
          <Button size="sm">+ Add plant</Button>
        </Link>
      </div>
      <PlantGrid plants={sorted} />
    </div>
  );
}
