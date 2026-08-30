import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const product = await prisma.product.findFirst({
    where: { id, active: true },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    currency: product.currency,
    type: product.type,
    stock: product.stock,
    active: product.active,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          sortOrder: product.category.sortOrder,
        }
      : null,
  });
}
