import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditPlantForm } from "./EditPlantForm";
import type { PlantWithImages } from "@/lib/types/database";

interface EditPlantPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit Plant" };

export default async function EditPlantPage({ params }: EditPlantPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: plant } = await supabase
    .from("plants")
    .select("*, plant_images(id, url, sort_order)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!plant) notFound();

  const typedPlant: PlantWithImages = {
    ...plant,
    plant_images: [...(plant.plant_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-earth-900">Edit plant</h1>
      <EditPlantForm plant={typedPlant} userId={user.id} />
    </div>
  );
}
