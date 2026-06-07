import { PlantCard } from "./PlantCard";
import type { PlantWithImages } from "@/lib/types/database";

interface PlantGridProps {
  plants: PlantWithImages[];
}

export function PlantGrid({ plants }: PlantGridProps) {
  if (plants.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-earth-200 py-16 text-center">
        <p className="text-4xl">🪴</p>
        <p className="mt-3 text-sm text-earth-800/60">
          No plants yet. Add your first one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {plants.map((plant) => (
        <PlantCard key={plant.id} plant={plant} />
      ))}
    </div>
  );
}
