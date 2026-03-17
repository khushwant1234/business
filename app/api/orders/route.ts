import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { PAYMENT_STATUSES } from "@/lib/site";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { customerName, phone, address, deliveryType, items } = body;

    if (!customerName || !phone || !address || !deliveryType || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["EXPRESS", "NORMAL"].includes(deliveryType)) {
      return NextResponse.json({ error: "Invalid delivery type" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.some((item) => !item.productId || item.quantity < 1)) {
      return NextResponse.json({ error: "Invalid order items" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        userId: user?.id,
        customerName,
        phone,
        address,
        deliveryType,
        paymentStatus: PAYMENT_STATUSES[0],
        items: {
          create: items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
