import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, sha256 } from "@/lib/auth/token";
import { sendMagicLink } from "@/lib/mail";
import { isRateLimited } from "@/lib/auth/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`magic:${ip}`)) {
    // 列挙対策のため成功レスポンスを返す（レートリミットであることを隠す）
    return NextResponse.json({ ok: true });
  }

  const body = await req.json().catch(() => null);
  const email = (body?.email ?? "").toString().trim().toLowerCase();

  // 常に同じレスポンスで、ユーザー存在の推測を防ぐ（列挙対策）
  const okResponse = NextResponse.json({ ok: true });

  if (!email || !email.includes("@")) return okResponse;

  const user = await prisma.user.findUnique({ where: { email } });

  // ユーザーがいなければ何もせずOK（招待制のため）
  if (!user) return okResponse;

  // ログイン用トークンを発行（15分）
  const token = generateToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.loginToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const url = `${appUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;

  await sendMagicLink(email, url);

  return okResponse;
}
