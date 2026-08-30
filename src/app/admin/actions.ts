"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ADMIN_COOKIE } from "@/lib/auth/admin-cookie";
import {
  createAdminSessionCookie,
  requireAdmin,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { getShopSettings } from "@/lib/settings";

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  price: z.coerce.number().int().min(0),
  currency: z.string().min(1),
  type: z.enum(["DIGITAL", "PHYSICAL", "SERVICE"]),
  stock: z.string().optional(),
  active: z.coerce.boolean().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().optional(),
});

const settingsSchema = z.object({
  name: z.string().min(1),
  welcomeMessage: z.string().min(1),
  currency: z.string().min(1),
  checkoutEnabled: z.coerce.boolean().optional(),
});

async function assertAdmin() {
  if (!(await requireAdmin())) {
    redirect("/admin/login");
  }
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }

  const session = createAdminSessionCookie();
  const store = await cookies();
  store.set(session.name, session.value, session.options);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function createProductAction(formData: FormData) {
  await assertAdmin();
  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    currency: formData.get("currency"),
    type: formData.get("type"),
    stock: formData.get("stock") ?? "",
    active: formData.get("active") === "on",
    imageUrl: formData.get("imageUrl") ?? "",
    categoryId: formData.get("categoryId") ?? "",
  });

  if (!parsed.success) {
    throw new Error("Invalid product data");
  }

  const settings = await getShopSettings();
  await prisma.product.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      currency: parsed.data.currency || settings.currency,
      type: parsed.data.type,
      stock: parsed.data.stock ? Number.parseInt(parsed.data.stock, 10) : null,
      active: Boolean(parsed.data.active),
      imageUrl: parsed.data.imageUrl || null,
      categoryId: parsed.data.categoryId || null,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProductAction(productId: string, formData: FormData) {
  await assertAdmin();
  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    currency: formData.get("currency"),
    type: formData.get("type"),
    stock: formData.get("stock") ?? "",
    active: formData.get("active") === "on",
    imageUrl: formData.get("imageUrl") ?? "",
    categoryId: formData.get("categoryId") ?? "",
  });

  if (!parsed.success) {
    throw new Error("Invalid product data");
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      currency: parsed.data.currency,
      type: parsed.data.type,
      stock: parsed.data.stock ? Number.parseInt(parsed.data.stock, 10) : null,
      active: Boolean(parsed.data.active),
      imageUrl: parsed.data.imageUrl || null,
      categoryId: parsed.data.categoryId || null,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProductAction(productId: string) {
  await assertAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateOrderStatusAction(orderId: string, formData: FormData) {
  await assertAdmin();
  const status = z
    .enum(["PENDING", "PAID", "FULFILLED", "CANCELLED"])
    .parse(formData.get("status"));

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateSettingsAction(formData: FormData) {
  await assertAdmin();
  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    welcomeMessage: formData.get("welcomeMessage"),
    currency: formData.get("currency"),
    checkoutEnabled: formData.get("checkoutEnabled") === "on",
  });

  if (!parsed.success) {
    throw new Error("Invalid settings");
  }

  const settings = await getShopSettings();
  await prisma.shopSettings.update({
    where: { id: settings.id },
    data: {
      name: parsed.data.name,
      welcomeMessage: parsed.data.welcomeMessage,
      currency: parsed.data.currency,
      checkoutEnabled: Boolean(parsed.data.checkoutEnabled),
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
