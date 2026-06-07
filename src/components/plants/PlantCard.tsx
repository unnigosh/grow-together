import Image from "next/image";
import Link from "next/link";
import type { PlantWithImages } from "@/lib/types/database";

interface PlantCardProps {
  plant: PlantWithImages;
}

export function PlantCard({ plant }: PlantCardProps) {
  const image = plant.plant_images?.[0]?.url;

  return (
    <Link
      href={`/plants/${plant.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-earth-200 bg-white shadow-sm transition hover:border-leaf-300 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-leaf-50">
        {image ? (
          <Image
            src={image}
            alt={plant.name}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🪴</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="font-semibold text-earth-900 group-hover:text-leaf-700">
          {plant.name}
        </h3>
        {plant.species && (
          <p className="mt-0.5 text-xs italic text-earth-800/60">{plant.species}</p>
        )}
        {plant.acquired_date && (
          <p className="mt-1 text-xs text-earth-800/50">
            Since {new Date(plant.acquired_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>
        )}
      </div>
    </Link>
  );
}
