import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function getRequiredString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function validateAddress(data: {
  country: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}) {
  if (
    !data.country ||
    !data.fullName ||
    !data.phone ||
    !data.address ||
    !data.city ||
    !data.state ||
    !data.pinCode
  ) {
    return "All required fields must be filled.";
  }

  if (!/^\d{6}$/.test(data.pinCode)) {
    return "PIN code must be 6 digits.";
  }

  return null;
}

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
    const country = getRequiredString(body.country) || "India";
    const fullName = getRequiredString(body.fullName);
    const phone = getRequiredString(body.phone);
    const address = getRequiredString(body.address);
    const addressLine2 = getOptionalString(body.addressLine2);
    const landmark = getOptionalString(body.landmark);
    const city = getRequiredString(body.city);
    const state = getRequiredString(body.state);
    const pinCode = getRequiredString(body.pinCode);
    const deliveryInstructions = getOptionalString(body.deliveryInstructions);
    const isDefault = Boolean(body.isDefault);
    const label = fullName || `${city} Address`;

    const validationError = validateAddress({
      country,
      fullName,
      phone,
      address,
      city,
      state,
      pinCode,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
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
          fullName,
          phone,
          country,
          address,
          addressLine2,
          landmark,
          city,
          state,
          pinCode,
          deliveryInstructions,
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
