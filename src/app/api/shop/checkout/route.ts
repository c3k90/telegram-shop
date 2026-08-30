import { NextResponse } from "next/server";
import { z } from "zod";
import { withTelegramAuth } from "@/lib/auth/shop";
import { upsertCustomerFromTelegram } from "@/lib/customers";
import { prisma } from "@/lib/prisma";
import { manualPaymentAdapter } from "@/lib/payments/manual";
import { getShopSettings } from "@/lib/settings";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  shippingName: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingPostal: z.string().optional(),
  shippingCountry: z.string().optional(),
  note: z.string().optional(),
});

export const POST = withTelegramAuth(async (req, user) => {
  const settings = await getShopSettings();
  if (!settings.checkoutEnabled) {
    return NextResponse.json(
      { error: "Checkout is currently disabled" },
      { status: 403 },
    );
  }

  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const productIds = parsed.data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "One or more products are unavailable" },
      { status: 400 },
    );
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const needsShipping = products.some((product) => product.type === "PHYSICAL");

  if (needsShipping) {
    const { shippingName, shippingAddress, shippingCity, shippingPostal } =
      parsed.data;
    if (!shippingName || !shippingAddress || !shippingCity || !shippingPostal) {
      return NextResponse.json(
        { error: "Shipping details are required for physical products" },
        { status: 400 },
      );
    }
  }

  let total = 0;
  const orderItems = parsed.data.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error("Product disappeared during checkout");
    }
    total += product.price * item.quantity;
    return {
      productId: product.id,
      title: product.title,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  const customer = await upsertCustomerFromTelegram(user);
  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      status: "PENDING",
      paymentProvider: "MANUAL",
      currency: settings.currency,
      total,
      shippingName: parsed.data.shippingName,
      shippingAddress: parsed.data.shippingAddress,
      shippingCity: parsed.data.shippingCity,
      shippingPostal: parsed.data.shippingPostal,
      shippingCountry: parsed.data.shippingCountry,
      note: parsed.data.note,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  const checkout = await manualPaymentAdapter.createCheckout(order);

  return NextResponse.json({
    order: {
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
    },
    checkout,
  });
});
