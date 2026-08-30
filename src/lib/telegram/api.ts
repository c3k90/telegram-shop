import { retrieveRawInitData } from "@telegram-apps/sdk";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function shopFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const raw = retrieveRawInitData();
  if (!raw) {
    throw new ApiError(401, "No initData — open this shop inside Telegram.");
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `tma ${raw}`);

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || `API ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
