"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlantImageUpload } from "@/components/plants/PlantImageUpload";

interface AddPlantFormProps {
  userId: string;
}

export function AddPlantForm({ userId }: AddPlantFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
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

    const { data: plant, error: plantError } = await supabase
      .from("plants")
      .insert({ user_id: userId, name, species, acquired_date })
      .select("id")
      .single();

    if (plantError || !plant) {
      setError(plantError?.message ?? "Failed to add plant.");
      setLoading(false);
      return;
    }

    if (imageUrls.length > 0) {
      await supabase.from("plant_images").insert(
        imageUrls.map((url, i) => ({
          plant_id: plant.id,
          url,
          sort_order: i,
        }))
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
        placeholder="Monstera, Peace Lily, Basil..."
      />
      <Input
        label="Species (optional)"
        name="species"
        placeholder="Monstera deliciosa"
      />
      <Input
        label="Acquired date (optional)"
        name="acquired_date"
        type="date"
      />
      <div>
        <p className="mb-2 text-sm font-medium text-earth-800">Photos</p>
        <PlantImageUpload userId={userId} onImagesChange={setImageUrls} />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Adding..." : "Add plant"}
      </Button>
    </form>
  );
}
