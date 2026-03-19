"use client";

import Image from "next/image";
import { Cpu } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  name: string;
  imageUrl: string | null;
};

export default function ProductImageGallery({ name, imageUrl }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const gallery = useMemo(() => {
    const base = imageUrl ? [imageUrl] : [];

    const placeholders = [
      "https://placehold.co/800x800/242424/f5f5f5?text=View+1",
      "https://placehold.co/800x800/2e2e2e/f5f5f5?text=View+2",
      "https://placehold.co/800x800/383838/f5f5f5?text=View+3",
      "https://placehold.co/800x800/444444/f5f5f5?text=View+4",
      "https://placehold.co/800x800/505050/f5f5f5?text=View+5",
    ];

    return [...base, ...placeholders].slice(0, 5);
  }, [imageUrl]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted">
        {imageUrl || activeIndex > 0 ? (
          <Image
            src={gallery[activeIndex]}
            alt={`${name} view ${activeIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-150"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Cpu className="size-14" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {gallery.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted"
            aria-label={`Switch to image ${index + 1}`}
          >
            {imageUrl || index > 0 ? (
              <Image
                src={src}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                className={`object-cover transition-opacity duration-150 ${
                  activeIndex === index ? "opacity-100" : "opacity-65"
                }`}
                sizes="100px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Cpu className="size-4" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        {gallery.map((_, index) => (
          <button
            key={`dot-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`size-2 rounded-full border border-border ${
              activeIndex === index ? "bg-foreground" : "bg-transparent"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
