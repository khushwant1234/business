import Image from "next/image";
import { notFound } from "next/navigation";

import ProductDetailActions from "@/components/ProductDetailActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getProductImage, PAYMENT_DETAILS } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-[minmax(0,1fr)_420px] md:px-6 md:py-16">
      <div className="space-y-6">
        <div className="relative aspect-square overflow-hidden rounded-sm border border-white/10 bg-muted">
          <Image
            src={getProductImage(product.imageUrl)}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-3 border-b border-white/10 pb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            {product.category}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-white">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-sm leading-7 text-white/70 md:text-base">
            {product.description}
          </p>
        </div>

        <ProductDetailActions
          product={{
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            imageUrl: product.imageUrl,
          }}
        />

        <Card className="rounded-sm border border-white/10 bg-card py-0">
          <CardHeader className="border-b border-white/10 py-4">
            <CardTitle>Payment details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-sm text-white/70">
            <p>
              <span className="text-white">Account Name:</span>{" "}
              {PAYMENT_DETAILS.accountName}
            </p>
            <p>
              <span className="text-white">Bank:</span>{" "}
              {PAYMENT_DETAILS.bankName}
            </p>
            <p>
              <span className="text-white">Account Number:</span>{" "}
              {PAYMENT_DETAILS.accountNumber}
            </p>
            <p>{PAYMENT_DETAILS.note}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
