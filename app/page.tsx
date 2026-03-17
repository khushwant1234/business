import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_NAME, PRODUCT_CATEGORIES } from "@/lib/site";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-6xl flex-col gap-16 px-4 py-16 md:px-6 md:py-20">
      <section className="max-w-3xl space-y-6 border-b border-white/10 pb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">
          Robotic Parts Store
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Precision components for robotics, embedded systems, and repair work.
        </h1>
        <p className="max-w-xl text-base leading-7 text-white/65 md:text-lg">
          {BRAND_NAME} supplies motors, sensors, controllers, and hard-to-source
          electronic parts through a minimal storefront built for technical
          buyers.
        </p>
        <Button asChild className="rounded-sm px-4 text-background">
          <Link href="/products">Browse Parts</Link>
        </Button>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Categories
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Core inventory groups
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PRODUCT_CATEGORIES.map((category) => (
            <Card
              key={category}
              className="rounded-sm border border-white/10 bg-card py-0"
            >
              <CardHeader className="border-b border-white/10 py-4">
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 text-sm text-white/65">
                <p>
                  Minimal presentation, direct pricing, and straightforward
                  ordering for {category.toLowerCase()} stock.
                </p>
                <Link
                  href="/products"
                  className="text-foreground transition-opacity hover:opacity-75"
                >
                  View category
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
