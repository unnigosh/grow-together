import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { AddNoteForm } from "@/components/plants/AddNoteForm";
import { NoteList } from "@/components/plants/NoteList";
import { DeletePlantButton } from "./DeletePlantButton";
import type { PlantWithDetails } from "@/lib/types/database";

interface PlantPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PlantPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("plants").select("name").eq("id", id).single();
  return { title: data?.name ?? "Plant" };
}

export default async function PlantPage({ params }: PlantPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: plant } = await supabase
    .from("plants")
    .select("*, plant_images(id, url, sort_order), plant_notes(id, plant_id, user_id, content, photo_url, height_cm, created_at)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!plant) notFound();

  const typedPlant = {
    ...plant,
    plant_images: [...(plant.plant_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    plant_notes: [...(plant.plant_notes ?? [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  } as PlantWithDetails;

  const coverImage = typedPlant.plant_images[0]?.url;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/plants" className="text-xs text-leaf-600 hover:underline">
            ← My Plants
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-earth-900">{typedPlant.name}</h1>
          {typedPlant.species && (
            <p className="mt-0.5 text-sm italic text-earth-800/60">{typedPlant.species}</p>
          )}
          {typedPlant.acquired_date && (
            <p className="mt-1 text-sm text-earth-800/50">
              Acquired{" "}
              {new Date(typedPlant.acquired_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/plants/${typedPlant.id}/edit`}>
            <Button size="sm" variant="outline">Edit</Button>
          </Link>
          <DeletePlantButton plantId={typedPlant.id} />
        </div>
      </div>

      {/* Cover image */}
      {coverImage && (
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-leaf-50">
          <Image src={coverImage} alt={typedPlant.name} fill className="object-cover" />
        </div>
      )}

      {/* Additional photos */}
      {typedPlant.plant_images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {typedPlant.plant_images.slice(1).map((img) => (
            <div key={img.id} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
              <Image src={img.url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Journal */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-earth-900">Journal</h2>
          <AddNoteForm plantId={typedPlant.id} userId={user.id} />
        </div>
        <NoteList notes={typedPlant.plant_notes} />
      </section>
    </div>
  );
}
