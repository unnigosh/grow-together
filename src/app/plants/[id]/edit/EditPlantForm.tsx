"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlantImageUpload } from "@/components/plants/PlantImageUpload";
import type { PlantWithImages } from "@/lib/types/database";

interface EditPlantFormProps {
  plant: PlantWithImages;
  userId: string;
}

export function EditPlantForm({ plant, userId }: EditPlantFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const initialImages = plant.plant_images.map((img) => img.url);
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string).trim();
    const species = (form.get("species") as string).trim() || null;
    const acquired_date = (form.get("acquired_date") as string) || null;

    const { error: updateError } = await supabase
      .from("plants")
      .update({ name, species, acquired_date })
      .eq("id", plant.id)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Replace images: delete existing, insert new set
    await supabase.from("plant_images").delete().eq("plant_id", plant.id);
    if (imageUrls.length > 0) {
      await supabase.from("plant_images").insert(
        imageUrls.map((url, i) => ({ plant_id: plant.id, url, sort_order: i }))
      );
    }

    router.push(`/plants/${plant.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <Input
        label="Name"
        name="name"
        required
        maxLength={100}
        defaultValue={plant.name}
      />
      <Input
        label="Species (optional)"
        name="species"
        defaultValue={plant.species ?? ""}
      />
      <Input
        label="Acquired date (optional)"
        name="acquired_date"
        type="date"
        defaultValue={plant.acquired_date ?? ""}
      />
      <div>
        <p className="mb-2 text-sm font-medium text-earth-800">Photos</p>
        <PlantImageUpload
          userId={userId}
          onImagesChange={setImageUrls}
          initialImages={initialImages}
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/plants/${plant.id}`)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
