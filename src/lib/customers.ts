import { prisma } from "@/lib/prisma";
import type { TelegramUser } from "@/lib/telegram/validate-init-data";

export async function upsertCustomerFromTelegram(user: TelegramUser) {
  return prisma.customer.upsert({
    where: { telegramId: String(user.id) },
    update: {
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
    },
    create: {
      telegramId: String(user.id),
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
    },
  });
}
