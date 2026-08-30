function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function getBotToken(): string {
  return required("BOT_TOKEN", process.env.BOT_TOKEN);
}

export function getAppUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getAdminPassword(): string {
  return required("ADMIN_PASSWORD", process.env.ADMIN_PASSWORD);
}

export function getAdminSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    required("ADMIN_PASSWORD", process.env.ADMIN_PASSWORD)
  );
}

export function getInitDataValidationToken(): string {
  if (process.env.NODE_ENV !== "production" && process.env.DEV_BOT_TOKEN) {
    return process.env.DEV_BOT_TOKEN;
  }
  return process.env.BOT_TOKEN || process.env.DEV_BOT_TOKEN || getBotToken();
}

export function getAdminTelegramIds(): string[] {
  return (process.env.ADMIN_TELEGRAM_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}
