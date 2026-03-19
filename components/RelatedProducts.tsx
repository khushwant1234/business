"use client";

import Image from "next/image";
import Link from "next/link";
import { Cpu } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null;
  sku: string | null;
};

type Props = {
  category: string;
  currentId: string;
};

export default function RelatedProducts({ category, currentId }: Props) {
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    async function load() {
      const response = await fetch(
        `/api/products?category=${encodeURIComponent(category)}&exclude=${encodeURIComponent(currentId)}&limit=4`,
      );

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      setProducts(Array.isArray(payload) ? payload : []);
    }

    load();
  }, [category, currentId]);

  if (!products.length) {
    return null;
  }

  const card = (product: ProductRow) => (
    <Link key={product.id} href={`/products/${product.id}`} className="block">
      <Card className="overflow-hidden rounded-sm border border-border py-0">
        <div className="relative aspect-square border-b border-border bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 75vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Cpu className="size-7" />
            </div>
          )}
        </div>
        <CardContent className="space-y-2 p-3">
          <p className="text-xs text-muted-foreground">{product.category}</p>
          <p className="line-clamp-2 text-sm font-medium leading-tight">
            {product.name}
          </p>
          <p className="text-sm font-semibold text-[#3b82f6]">
            ₹{product.price.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            SKU: {product.sku ?? "N/A"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Related Products</h2>
        <Separator />
      </div>

      <div className="overflow-x-auto md:hidden">
        <div className="flex min-w-max gap-3 pb-2">{products.map(card)}</div>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-4">
        {products.map(card)}
      </div>
    </section>
  );
}
