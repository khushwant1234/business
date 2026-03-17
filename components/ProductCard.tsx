"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartContext";
import { getProductImage } from "@/lib/site";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null;
}

export default function ProductCard({
  id,
  name,
  category,
  price,
  imageUrl,
}: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="group overflow-hidden rounded-sm border border-white/10 bg-card py-0">
      <Link href={`/products/${id}`}>
        <div className="relative aspect-square bg-muted">
          <Image
            src={getProductImage(imageUrl)}
            alt={name}
            fill
            className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      </Link>
      <CardContent className="space-y-2 p-4">
        <p className="text-white/50 text-xs uppercase tracking-wider">
          {category}
        </p>
        <Link href={`/products/${id}`}>
          <h3 className="text-sm font-medium leading-tight text-white transition-opacity hover:text-white/80">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-1">
          <span className="text-white font-semibold text-sm">
            ${price.toFixed(2)}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="rounded-sm border-white/20 bg-transparent text-xs text-white hover:bg-white hover:text-background"
            onClick={() => addToCart({ id, name, price, imageUrl, category })}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
