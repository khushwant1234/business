import { redirect } from "next/navigation";

import AdminTabs from "@/components/AdminTabs";
import { requireAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdminUser();

  if (!user) {
    redirect("/products");
  }

  const [products, orders, requests] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.productRequest.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">
          Admin
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-white/65">
          Manage products, review orders, and inspect incoming part requests.
        </p>
      </div>

      <AdminTabs
        initialProducts={products}
        initialOrders={orders.map((order: (typeof orders)[number]) => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
        }))}
        initialRequests={requests.map((request: (typeof requests)[number]) => ({
          ...request,
          createdAt: request.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
