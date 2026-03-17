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

  const profile = await db.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  return profile.id;
}

export async function GET() {
  try {
    const db = prisma as any;
    const profileId = await getProfileIdForUser();

    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await db.deliveryAddress.findMany({
      where: { profileId },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = prisma as any;
    const profileId = await getProfileIdForUser();

    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const label = String(body.label ?? "").trim();
    const address = String(body.address ?? "").trim();
    const city = String(body.city ?? "").trim();
    const pinCode = String(body.pinCode ?? "").trim();
    const isDefault = Boolean(body.isDefault);

    if (!label || !address || !city || !pinCode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const created = await db.$transaction(async (tx: any) => {
      if (isDefault) {
        await tx.deliveryAddress.updateMany({
          where: { profileId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.deliveryAddress.create({
        data: {
          profileId,
          label,
          address,
          city,
          pinCode,
          isDefault,
        },
      });
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create address:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
