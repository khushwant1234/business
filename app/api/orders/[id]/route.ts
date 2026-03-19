import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { DELIVERY_STATUSES, PAYMENT_STATUSES } from "@/lib/site";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentStatus, deliveryStatus } = body;

    if (!paymentStatus && !deliveryStatus) {
      return NextResponse.json(
        { error: "Provide paymentStatus or deliveryStatus" },
        { status: 400 },
      );
    }

    if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 },
      );
    }

    if (deliveryStatus && !DELIVERY_STATUSES.includes(deliveryStatus)) {
      return NextResponse.json(
        { error: "Invalid delivery status" },
        { status: 400 },
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(deliveryStatus ? { deliveryStatus } : {}),
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
