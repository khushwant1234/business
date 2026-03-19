import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function getRequiredString(value: unknown, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

function getOptionalString(value: unknown, fallback: string | null = null) {
  if (typeof value !== "string") {
    return fallback;
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
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
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
    const profileId = await getProfileIdForUser();

    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const hasAddressPayload = [
      "country",
      "fullName",
      "phone",
      "address",
      "addressLine2",
      "landmark",
      "city",
      "state",
      "pinCode",
      "deliveryInstructions",
    ].some((key) => key in body);
    const isDefault = typeof body.isDefault === "boolean" ? body.isDefault : undefined;

    const existing = await prisma.deliveryAddress.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (isDefault) {
        await tx.deliveryAddress.updateMany({
          where: { profileId, isDefault: true },
          data: { isDefault: false },
        });
      }

      let data: Record<string, string | boolean | null | undefined> = {
        isDefault,
      };

      if (hasAddressPayload) {
        const country = getRequiredString(body.country, "India") || "India";
        const fullName = getRequiredString(body.fullName, "");
        const phone = getRequiredString(body.phone, "");
        const address = getRequiredString(body.address, existing.address);
        const addressLine2 = getOptionalString(body.addressLine2, null);
        const landmark = getOptionalString(body.landmark, null);
        const city = getRequiredString(body.city, existing.city);
        const state = getRequiredString(body.state, "");
        const pinCode = getRequiredString(body.pinCode, existing.pinCode);
        const deliveryInstructions = getOptionalString(body.deliveryInstructions, null);
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
          throw new Error(validationError);
        }

        data = {
          ...data,
          label: fullName || existing.label || `${city} Address`,
          country,
          fullName,
          phone,
          address,
          addressLine2,
          landmark,
          city,
          state,
          pinCode,
          deliveryInstructions,
        };
      }

      return tx.deliveryAddress.update({
        where: { id },
        data,
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update address:", error);
    if (error instanceof Error && error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profileId = await getProfileIdForUser();

    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.deliveryAddress.findFirst({
      where: { id, profileId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.deliveryAddress.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete address:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
