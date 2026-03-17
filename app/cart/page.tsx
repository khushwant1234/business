"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProductImage } from "@/lib/site";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotal } = useCart();

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-[minmax(0,1fr)_320px] md:px-6 md:py-16">
      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Cart
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Current order
          </h1>
        </div>

        {items.length ? (
          <div className="space-y-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className="rounded-sm border border-white/10 bg-card py-0"
              >
                <CardContent className="grid gap-4 p-4 md:grid-cols-[96px_minmax(0,1fr)_140px] md:items-center">
                  <div className="relative aspect-square overflow-hidden rounded-sm border border-white/10 bg-muted">
                    <Image
                      src={getProductImage(item.imageUrl)}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <Link
                      href={`/products/${item.id}`}
                      className="text-base font-medium text-white"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-white/55">{item.category}</p>
                    <p className="text-sm text-white">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      className="rounded-sm border-white/10 bg-transparent"
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        updateQuantity(
                          item.id,
                          Number.isFinite(nextValue) ? nextValue : 1,
                        );
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-sm px-0 text-white/60 hover:text-white"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-sm border border-white/10 bg-card py-0">
            <CardContent className="space-y-4 p-4 text-sm text-white/70">
              <p>Your cart is empty.</p>
              <Button asChild className="w-fit rounded-sm">
                <Link href="/products" className="text-background">
                  Browse products
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <aside>
        <Card className="rounded-sm border border-white/10 bg-card py-0">
          <CardHeader className="border-b border-white/10 py-4">
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="flex items-center justify-between text-base text-white">
              <span>Total</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
            <Button
              asChild
              className="w-full rounded-sm"
              disabled={!items.length}
            >
              <Link href="/checkout" className="text-background">
                Proceed to Checkout
              </Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
