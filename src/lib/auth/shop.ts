import { NextRequest, NextResponse } from "next/server";
import { getInitDataValidationToken } from "@/lib/env";
import {
  validateInitData,
  type TelegramUser,
} from "@/lib/telegram/validate-init-data";

export function getTelegramUserFromRequest(
  req: NextRequest,
): TelegramUser | null {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("tma ")) {
    return null;
  }

  const result = validateInitData(
    authHeader.slice(4),
    getInitDataValidationToken(),
  );

  if (!result.valid || !result.data?.user) {
    return null;
  }

  return result.data.user;
}

export function withTelegramAuth(
  handler: (
    req: NextRequest,
    user: TelegramUser,
    context?: { params: Promise<Record<string, string>> },
  ) => Promise<NextResponse>,
) {
  return async (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> },
  ) => {
    try {
      const user = getTelegramUserFromRequest(req);
      if (!user) {
        return NextResponse.json(
          { error: "Missing or invalid Telegram authorization" },
          { status: 401 },
        );
      }
      return handler(req, user, context);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authorization failed";
      return NextResponse.json({ error: message }, { status: 401 });
    }
  };
}
