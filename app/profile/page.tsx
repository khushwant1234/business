import { redirect } from "next/navigation";

import ProfilePageClient from "@/components/ProfilePageClient";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const db = prisma as any;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    include: {
      addresses: {
        orderBy: [{ isDefault: "desc" }, { id: "desc" }],
      },
    },
  });

  const orders = await db.order.findMany({
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
      initialAddresses={profile?.addresses ?? []}
      orders={orders}
    />
  );
}
