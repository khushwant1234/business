"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null;
}

export default function ProductCard({ id, name, category, price, imageUrl }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="bg-[#202020] border-white/10 overflow-hidden group">
      <Link href={`/products/${id}`}>
        <div className="relative aspect-square bg-[#1a1a1a]">
          <Image
            src={imageUrl || "https://placehold.co/400x400/202020/ffffff?text=No+Image"}
            alt={name}
            fill
            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      </Link>
      <CardContent className="p-4 space-y-2">
        <p className="text-white/50 text-xs uppercase tracking-wider">{category}</p>
        <Link href={`/products/${id}`}>
          <h3 className="text-white text-sm font-medium leading-tight hover:text-white/80 transition-opacity">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-1">
          <span className="text-white font-semibold text-sm">${price.toFixed(2)}</span>
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-white/20 text-white hover:bg-white hover:text-[#202020]"
            onClick={() =>
              addToCart({ id, name, price, imageUrl, category })
            }
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
