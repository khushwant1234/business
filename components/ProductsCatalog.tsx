"use client";

import { useState } from "react";

import ProductCard from "@/components/ProductCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProductSummary = {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null;
};

interface ProductsCatalogProps {
  products: ProductSummary[];
  categories: string[];
}

export default function ProductsCatalog({
  products,
  categories,
}: ProductsCatalogProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <div className="space-y-8">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList
          variant="line"
          className="w-full flex-wrap justify-start gap-2 border-b border-white/10 p-0 pb-3"
        >
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="rounded-sm border border-white/10 px-3 py-2 text-sm data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-background"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredProducts.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="rounded-sm border border-white/10 px-4 py-8 text-sm text-white/65">
          No products match the selected category.
        </div>
      )}
    </div>
  );
}
