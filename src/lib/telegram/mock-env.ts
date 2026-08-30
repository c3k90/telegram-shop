import { mockTelegramEnv } from "@telegram-apps/sdk-react";

async function hmacSha256(
  key: BufferSource,
  data: string,
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function signMockInitData(devBotToken: string): Promise<string> {
  const params = new URLSearchParams([
    [
      "user",
      JSON.stringify({
        id: 123456789,
        first_name: "Dev",
        last_name: "User",
        username: "devuser",
        language_code: "en",
      }),
    ],
    ["auth_date", String(Math.floor(Date.now() / 1000))],
    ["query_id", "AAH-mock-query-id"],
  ]);

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = await hmacSha256(
    new TextEncoder().encode("WebAppData"),
    devBotToken,
  );
  const hash = toHex(await hmacSha256(secret, dataCheckString));
  params.append("hash", hash);
  return params.toString();
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
}

export async function mockDevEnvironment(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!isLocalHostname(window.location.hostname)) return;

  const devToken = process.env.NEXT_PUBLIC_DEV_BOT_TOKEN;
  if (!devToken) {
    console.warn(
      "Set NEXT_PUBLIC_DEV_BOT_TOKEN to sign mock initData; UI will load but API calls will 401.",
    );
  }

  const initDataRaw = devToken ? await signMockInitData(devToken) : "";

  mockTelegramEnv({
    launchParams: {
      tgWebAppData: initDataRaw,
      tgWebAppVersion: "8.0",
      tgWebAppPlatform: "tdesktop",
      tgWebAppThemeParams: {
        accent_text_color: "#6ab2f2",
        bg_color: "#17212b",
        button_color: "#5288c1",
        button_text_color: "#ffffff",
        destructive_text_color: "#ec3942",
        header_bg_color: "#17212b",
        hint_color: "#708499",
        link_color: "#6ab3f3",
        secondary_bg_color: "#232e3c",
        section_bg_color: "#17212b",
        section_header_text_color: "#6ab3f3",
        subtitle_text_color: "#708499",
        text_color: "#f5f5f5",
      },
    },
  });
}
