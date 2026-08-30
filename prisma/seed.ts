import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await prisma.shopSettings.upsert({
    where: { id: "seed-settings" },
    update: {},
    create: {
      id: "seed-settings",
      name: "Telegram Shop",
      welcomeMessage:
        "Welcome to the demo shop. Digital and physical products are both supported.",
      currency: "EUR",
      checkoutEnabled: true,
    },
  });

  const digital = await prisma.category.upsert({
    where: { id: "seed-digital" },
    update: { name: "Digital", sortOrder: 1 },
    create: { id: "seed-digital", name: "Digital", sortOrder: 1 },
  });

  const physical = await prisma.category.upsert({
    where: { id: "seed-physical" },
    update: { name: "Physical", sortOrder: 2 },
    create: { id: "seed-physical", name: "Physical", sortOrder: 2 },
  });

  await prisma.product.upsert({
    where: { id: "seed-sticker-pack" },
    update: {},
    create: {
      id: "seed-sticker-pack",
      title: "Premium sticker pack",
      description: "A digital sticker pack delivered after the order is marked paid.",
      price: 299,
      currency: "EUR",
      type: "DIGITAL",
      stock: null,
      active: true,
      categoryId: digital.id,
    },
  });

  await prisma.product.upsert({
    where: { id: "seed-wallpaper" },
    update: {},
    create: {
      id: "seed-wallpaper",
      title: "Phone wallpaper set",
      description: "Five high-resolution wallpapers. Digital download.",
      price: 199,
      currency: "EUR",
      type: "DIGITAL",
      stock: null,
      active: true,
      categoryId: digital.id,
    },
  });

  await prisma.product.upsert({
    where: { id: "seed-mug" },
    update: {},
    create: {
      id: "seed-mug",
      title: "Shop mug",
      description: "Ceramic mug. Add a shipping address at checkout.",
      price: 1499,
      currency: "EUR",
      type: "PHYSICAL",
      stock: 25,
      active: true,
      categoryId: physical.id,
    },
  });

  await prisma.product.upsert({
    where: { id: "seed-consult" },
    update: {},
    create: {
      id: "seed-consult",
      title: "30-minute consult",
      description: "A service slot. The shop owner will contact you after payment.",
      price: 4500,
      currency: "EUR",
      type: "SERVICE",
      stock: 8,
      active: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
