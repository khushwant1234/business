import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

async function getSessionUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { id: "desc" }],
        },
      },
    });

    return NextResponse.json({
      profile,
      email: user.email,
    });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Failed to create profile:", error);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : undefined;
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
    const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : undefined;

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        fullName,
        phone,
        avatarUrl,
      },
      create: {
        userId: user.id,
        fullName,
        phone,
        avatarUrl,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
