import { NextResponse } from "next/server";
import { withTelegramAuth } from "@/lib/auth/shop";
import { upsertCustomerFromTelegram } from "@/lib/customers";
import { prisma } from "@/lib/prisma";

export const GET = withTelegramAuth(async (_req, user) => {
  const customer = await upsertCustomerFromTelegram(user);
  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    orders.map((order) => ({
      id: order.id,
      status: order.status,
      paymentProvider: order.paymentProvider,
      currency: order.currency,
      total: order.total,
      shippingName: order.shippingName,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingPostal: order.shippingPostal,
      shippingCountry: order.shippingCountry,
      note: order.note,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      createdAt: order.createdAt.toISOString(),
    })),
  );
});
