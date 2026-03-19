import { redirect } from "next/navigation";

import ProfilePageClient from "@/components/ProfilePageClient";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      addresses: {
        orderBy: [{ isDefault: "desc" }, { id: "desc" }],
      },
    },
  });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const normalizedAddresses = (profile?.addresses ?? []).map((address) => ({
    id: address.id,
    label: address.label,
    fullName: null,
    phone: null,
    country: "India",
    address: address.address,
    addressLine2: null,
    landmark: null,
    city: address.city,
    state: null,
    pinCode: address.pinCode,
    deliveryInstructions: null,
    isDefault: address.isDefault,
  }));

  const normalizedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    deliveryStatus:
      "deliveryStatus" in order && typeof order.deliveryStatus === "string"
        ? order.deliveryStatus
        : "PROCESSING",
  }));

  return (
    <ProfilePageClient
      email={user.email ?? ""}
      initialProfile={
        profile
          ? {
              fullName: profile.fullName,
              phone: profile.phone,
              avatarUrl: profile.avatarUrl,
            }
          : null
      }
      initialAddresses={normalizedAddresses}
      orders={normalizedOrders}
    />
  );
}
