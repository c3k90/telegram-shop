import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth/admin-cookie";
import { getAdminPassword, getAdminSessionSecret } from "@/lib/env";

export { ADMIN_COOKIE };
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sign(value: string): string {
  return createHmac("sha256", getAdminSessionSecret())
    .update(value)
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function createAdminSessionCookie(): {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    sameSite: "lax";
    secure: boolean;
    path: string;
    maxAge: number;
  };
} {
  const issuedAt = String(Math.floor(Date.now() / 1000));
  const value = `${issuedAt}.${sign(issuedAt)}`;
  return {
    name: ADMIN_COOKIE,
    value,
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    },
  };
}

export function isAdminSessionValid(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const [issuedAt, signature] = cookieValue.split(".");
  if (!issuedAt || !signature) return false;

  const issued = Number.parseInt(issuedAt, 10);
  if (Number.isNaN(issued)) return false;
  if (Math.floor(Date.now() / 1000) - issued > MAX_AGE_SECONDS) return false;

  return safeEqual(signature, sign(issuedAt));
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  return isAdminSessionValid(store.get(ADMIN_COOKIE)?.value);
}
