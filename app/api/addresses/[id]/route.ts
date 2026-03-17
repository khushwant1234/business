import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function getProfileIdForUser() {
  const db = prisma as any;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  return profile?.id ?? null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = prisma as any;
    const profileId = await getProfileIdForUser();

    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const label = typeof body.label === "string" ? body.label.trim() : undefined;
    const address = typeof body.address === "string" ? body.address.trim() : undefined;
    const city = typeof body.city === "string" ? body.city.trim() : undefined;
    const pinCode = typeof body.pinCode === "string" ? body.pinCode.trim() : undefined;
    const isDefault = typeof body.isDefault === "boolean" ? body.isDefault : undefined;

    const existing = await db.deliveryAddress.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const updated = await db.$transaction(async (tx: any) => {
      if (isDefault) {
        await tx.deliveryAddress.updateMany({
          where: { profileId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.deliveryAddress.update({
        where: { id },
        data: {
          label,
          address,
          city,
          pinCode,
          isDefault,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update address:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = prisma as any;
    const profileId = await getProfileIdForUser();

    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.deliveryAddress.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await db.deliveryAddress.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete address:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
