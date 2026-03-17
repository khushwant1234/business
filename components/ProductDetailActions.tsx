"use client";

import { useState } from "react";

import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductDetailActionsProps {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    imageUrl: string | null;
  };
}

export default function ProductDetailActions({
  product,
}: ProductDetailActionsProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">
          Quantity
        </p>
        <div className="flex w-full max-w-xs items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-sm border-white/10 bg-transparent px-3"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            -
          </Button>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              setQuantity(
                Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1,
              );
            }}
            className="rounded-sm border-white/10 bg-transparent text-center"
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-sm border-white/10 bg-transparent px-3"
            onClick={() => setQuantity((value) => value + 1)}
          >
            +
          </Button>
        </div>
      </div>

      <Button
        type="button"
        className="rounded-sm px-4"
        onClick={() => addToCart(product, quantity)}
      >
        Add to Cart
      </Button>
    </div>
  );
}
