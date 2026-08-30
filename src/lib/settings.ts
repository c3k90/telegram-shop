import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS = {
  name: "Telegram Shop",
  welcomeMessage: "Welcome — browse the catalog and place an order.",
  currency: "EUR",
  checkoutEnabled: true,
};

export async function getShopSettings() {
  const existing = await prisma.shopSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  return prisma.shopSettings.create({ data: DEFAULT_SETTINGS });
}
