import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { getAppUrl } from "@/lib/env";

let bot: Bot | null = null;

function registerHandlers(instance: Bot) {
  instance.command("start", async (ctx) => {
    const appUrl = getAppUrl();
    const keyboard = new InlineKeyboard().webApp("Open shop", appUrl);

    await ctx.reply(
      "Welcome to the shop. Tap the button below to browse products.",
      { reply_markup: keyboard },
    );
  });

  instance.command("help", async (ctx) => {
    await ctx.reply(
      "Commands:\n/start — Open the shop\n/help — Show this message",
    );
  });

  instance.catch((err) => {
    console.error("Bot error:", err);
  });
}

export function getBot(): Bot {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error("BOT_TOKEN is not set");
  }

  if (!bot) {
    bot = new Bot(token);
    registerHandlers(bot);
  }

  return bot;
}

export function getWebhookHandler() {
  return webhookCallback(getBot(), "std/http");
}
