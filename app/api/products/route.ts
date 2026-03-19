import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const exclude = searchParams.get("exclude");
    const limitParam = searchParams.get("limit");
    const take = limitParam ? Number(limitParam) : undefined;

    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(exclude ? { id: { not: exclude } } : {}),
      },
      ...(take && take > 0 ? { take } : {}),
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      category,
      description,
      price,
      imageUrl,
      sku,
      isInStock,
      brand,
      tags,
      highlights,
      features,
      packageIncludes,
      specifications,
      attachments,
      videoUrl,
      qna,
      otherInfo,
    } = body;

    if (!name || !category || !description || price == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category,
        description,
        price: Number(price),
        imageUrl: imageUrl || null,
        sku: sku || null,
        isInStock: isInStock ?? true,
        brand: brand || null,
        tags: tags ?? null,
        highlights: highlights ?? null,
        features: features ?? null,
        packageIncludes: packageIncludes ?? null,
        specifications: specifications ?? null,
        attachments: attachments ?? null,
        videoUrl: videoUrl || null,
        qna: qna ?? null,
        otherInfo: otherInfo ?? null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
