import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const COOKIE_NAME = "md_session";

type SessionPayload = {
  userId: string;
  organizationId: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  exp: number; // epoch ms
};

function requireSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.trim().length < 32) {
    throw new Error("SESSION_SECRET is missing or too short (min 32 chars).");
  }
  return s;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", requireSecret()).update(data).digest("base64url");
}

function encode(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(data);
  return `${data}.${sig}`;
}

function decode(value: string): SessionPayload | null {
  const [data, sig] = value.split(".");
  if (!data || !sig) return null;
  if (sign(data) !== sig) return null;

  try {
    const json = Buffer.from(data, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as SessionPayload;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** ✅ 書き込みは NextResponse 経由（Route Handler用） */
export function setSessionCookie(
  res: NextResponse,
  payload: Omit<SessionPayload, "exp">,
  maxAgeSeconds = 60 * 60 * 12
) {
  const exp = Date.now() + maxAgeSeconds * 1000;
  const value = encode({ ...payload, exp });

  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

/** ✅ 読み取りは async（Next.js の cookies() が Promise になったため） */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return null;
  return decode(value);
}
