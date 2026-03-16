import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productName, category, description, reason, contact } = body;

    if (!productName || !category || !description || !reason || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const req = await prisma.productRequest.create({
      data: { productName, category, description, reason, contact },
    });

    return NextResponse.json(req, { status: 201 });
  } catch (error) {
    console.error("Failed to create request:", error);
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const requests = await prisma.productRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Failed to fetch requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
