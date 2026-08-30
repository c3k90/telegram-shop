import { NextRequest, NextResponse } from "next/server";
import { getWebhookHandler } from "@/lib/bot";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.BOT_TOKEN) {
    return NextResponse.json(
      { error: "BOT_TOKEN is not configured" },
      { status: 503 },
    );
  }

  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
    if (secretHeader !== webhookSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    return await getWebhookHandler()(req);
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
