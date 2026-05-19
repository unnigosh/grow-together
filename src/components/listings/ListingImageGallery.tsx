"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";

interface GalleryImage {
  id: string;
  url: string;
}

interface ListingImageGalleryProps {
  images: GalleryImage[];
  title: string;
  isSold?: boolean;
}

export function ListingImageGallery({
  images,
  title,
  isSold,
}: ListingImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = images[selectedIndex];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-leaf-50 shadow-md ring-1 ring-earth-200/60 sm:aspect-[5/4] lg:aspect-auto lg:min-h-[28rem]">
        {current ? (
          <Image
            src={current.url}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        ) : (
          <div className="flex h-full min-h-[16rem] items-center justify-center text-7xl sm:min-h-[20rem] lg:min-h-[28rem]">
            🪴
          </div>
        )}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
            <Badge variant="sold">Sold</Badge>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition sm:h-24 sm:w-24 ${
                index === selectedIndex
                  ? "ring-leaf-500"
                  : "ring-transparent opacity-80 hover:opacity-100"
              }`}
              aria-label={`View image ${index + 1}`}
              aria-current={index === selectedIndex}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
