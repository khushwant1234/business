import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, Headphones, Package, Truck } from "lucide-react";

import ProductDetailTabs from "@/components/ProductDetailTabs";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductImageGallery from "@/components/ProductImageGallery";
import RelatedProducts from "@/components/RelatedProducts";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function toAttachments(value: unknown): Array<{ name: string; url: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as { name?: unknown; url?: unknown };
      if (typeof row.name !== "string" || typeof row.url !== "string") {
        return null;
      }

      return { name: row.name, url: row.url };
    })
    .filter((item): item is { name: string; url: string } => Boolean(item));
}

function toQna(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{
      question: string;
      askedBy: string;
      date: string;
      answer: string;
    }>;
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as {
        question?: unknown;
        askedBy?: unknown;
        date?: unknown;
        answer?: unknown;
      };

      if (
        typeof row.question !== "string" ||
        typeof row.askedBy !== "string" ||
        typeof row.date !== "string" ||
        typeof row.answer !== "string"
      ) {
        return null;
      }

      return {
        question: row.question,
        askedBy: row.askedBy,
        date: row.date,
        answer: row.answer,
      };
    })
    .filter(
      (
        item,
      ): item is {
        question: string;
        askedBy: string;
        date: string;
        answer: string;
      } => Boolean(item),
    );
}

function toOtherInfo(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const data = value as {
    origin?: unknown;
    importBy?: unknown;
    address?: unknown;
    customerCare?: unknown;
  };

  const customerCare =
    data.customerCare && typeof data.customerCare === "object"
      ? (data.customerCare as { phone?: unknown; email?: unknown })
      : null;

  return {
    origin: typeof data.origin === "string" ? data.origin : undefined,
    importBy: typeof data.importBy === "string" ? data.importBy : undefined,
    address: typeof data.address === "string" ? data.address : undefined,
    customerCare: customerCare
      ? {
          phone:
            typeof customerCare.phone === "string"
              ? customerCare.phone
              : undefined,
          email:
            typeof customerCare.email === "string"
              ? customerCare.email
              : undefined,
        }
      : undefined,
  };
}

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

  const highlights = toStringArray(product.highlights);
  const tags = toStringArray(product.tags);
  const features = toStringArray(product.features);
  const packageIncludes = toStringArray(product.packageIncludes);
  const specifications = toStringRecord(product.specifications);
  const attachments = toAttachments(product.attachments);
  const qna = toQna(product.qna);
  const otherInfo = toOtherInfo(product.otherInfo);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12 md:px-6 md:py-16">
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <ProductImageGallery
            name={product.name}
            imageUrl={product.imageUrl}
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-3 border-b border-border pb-5">
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-xs text-muted-foreground underline"
            >
              {product.category}
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {product.name}
            </h1>
            <Badge variant="outline" className="rounded-sm">
              {product.isInStock ? "In Stock" : "Out of Stock"}
            </Badge>
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku ?? "N/A"}
            </p>

            {highlights.length ? (
              <ul className="space-y-1 text-sm text-muted-foreground">
                {highlights.slice(0, 6).map((highlight, index) => (
                  <li key={`highlight-${index}`}>› {highlight}</li>
                ))}
              </ul>
            ) : null}

            <p className="text-3xl font-semibold text-[#3b82f6]">
              ₹{product.price.toFixed(2)}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (Incl. GST)
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 divide-x divide-border rounded-sm border border-border md:grid-cols-4">
            <Link href="/request" className="space-y-1 p-3 text-center text-sm">
              <Package className="mx-auto size-4 text-muted-foreground" />
              <p>Bulk Order?</p>
              <p className="text-muted-foreground">Click Here</p>
            </Link>
            <a
              href="mailto:support@robu.in"
              className="space-y-1 p-3 text-center text-sm"
            >
              <Headphones className="mx-auto size-4 text-muted-foreground" />
              <p>Need Support?</p>
              <p className="text-muted-foreground">Click Here</p>
            </a>
            <div className="space-y-1 p-3 text-center text-sm">
              <Truck className="mx-auto size-4 text-muted-foreground" />
              <p>Free Delivery</p>
              <p className="text-muted-foreground">above ₹999</p>
            </div>
            <div className="space-y-1 p-3 text-center text-sm">
              <Banknote className="mx-auto size-4 text-muted-foreground" />
              <p>Cash on Delivery*</p>
            </div>
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

          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Brand:{" "}
              <span className="text-foreground">{product.brand ?? "N/A"}</span>
            </p>
            <p className="text-muted-foreground">
              Category:{" "}
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-foreground underline"
              >
                {product.category}
              </Link>
            </p>
            <p className="text-muted-foreground">
              Tags:{" "}
              {tags.length
                ? tags.map((tag, index) => (
                    <span key={`${tag}-${index}`}>
                      <Link
                        href={`/products?category=${encodeURIComponent(product.category)}`}
                        className="text-foreground underline"
                      >
                        {tag}
                      </Link>
                      {index < tags.length - 1 ? ", " : ""}
                    </span>
                  ))
                : "N/A"}
            </p>
          </div>

          <Link
            href="/request"
            className="text-sm text-muted-foreground underline"
          >
            Didn&apos;t find what you&apos;re looking for?
          </Link>
        </div>
      </section>

      <ProductDetailTabs
        description={product.description}
        features={features}
        packageIncludes={packageIncludes}
        specifications={specifications}
        attachments={attachments}
        videoUrl={product.videoUrl}
        qna={qna}
        otherInfo={otherInfo}
      />

      <RelatedProducts category={product.category} currentId={product.id} />
    </div>
  );
}
