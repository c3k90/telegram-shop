import { createHmac, timingSafeEqual } from "node:crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface InitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
}

export interface ValidationResult {
  valid: boolean;
  data?: InitData;
  error?: string;
}

const MAX_AGE_SECONDS = 86_400;

export function validateInitData(
  initDataRaw: string,
  botToken: string,
): ValidationResult {
  if (!initDataRaw || !botToken) {
    return { valid: false, error: "Missing initData or bot token" };
  }

  const params = new URLSearchParams(initDataRaw);
  const hash = params.get("hash");

  if (!hash) {
    return { valid: false, error: "Missing hash in initData" };
  }

  if (!/^[0-9a-f]{64}$/i.test(hash)) {
    return { valid: false, error: "Invalid hash format in initData" };
  }

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const computedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const computedBuf = Buffer.from(computedHash, "hex");
  const hashBuf = Buffer.from(hash, "hex");

  if (
    computedBuf.length !== hashBuf.length ||
    !timingSafeEqual(computedBuf, hashBuf)
  ) {
    return { valid: false, error: "Invalid hash — signature mismatch" };
  }

  const authDateStr = params.get("auth_date");
  if (!authDateStr) {
    return { valid: false, error: "Missing auth_date in initData" };
  }

  const authDate = Number.parseInt(authDateStr, 10);
  const now = Math.floor(Date.now() / 1000);

  if (Number.isNaN(authDate) || now - authDate > MAX_AGE_SECONDS) {
    return { valid: false, error: "initData expired" };
  }

  const userStr = params.get("user");
  let user: TelegramUser | undefined;
  if (userStr) {
    try {
      user = JSON.parse(userStr) as TelegramUser;
    } catch {
      return { valid: false, error: "Invalid user JSON in initData" };
    }
  }

  return {
    valid: true,
    data: {
      query_id: params.get("query_id") || undefined,
      user,
      auth_date: authDate,
      hash,
      start_param: params.get("start_param") || undefined,
      chat_type: params.get("chat_type") || undefined,
      chat_instance: params.get("chat_instance") || undefined,
    },
  };
}
