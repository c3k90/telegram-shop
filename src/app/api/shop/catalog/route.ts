import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getShopSettings } from "@/lib/settings";

export async function GET() {
  const [settings, categories, products] = await Promise.all([
    getShopSettings(),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    settings: {
      id: settings.id,
      name: settings.name,
      welcomeMessage: settings.welcomeMessage,
      currency: settings.currency,
      checkoutEnabled: settings.checkoutEnabled,
    },
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
    })),
    products: products.map((product) => ({
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
    })),
  });
}
