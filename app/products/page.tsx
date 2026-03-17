import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/site";
import ProductsCatalog from "@/components/ProductsCatalog";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      imageUrl: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">
          Catalog
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Robotic and electronic parts
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-white/65 md:text-base">
          Every product shown here is loaded from Prisma-backed inventory data.
        </p>
      </div>

      <ProductsCatalog products={products} categories={[...CATEGORIES]} />
    </div>
  );
}
