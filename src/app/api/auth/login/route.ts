import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { isRateLimited } from "@/lib/auth/rateLimit";

const ERR = "メールアドレスまたはパスワードが正しくありません";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`login:${ip}`)) {
    return NextResponse.json(
      { ok: false, error: "試行回数が多すぎます。しばらく待ってから再試行してください。" },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const email = (body?.email ?? "").toString().trim().toLowerCase();
  const password = (body?.password ?? "").toString();

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: ERR }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ ok: false, error: ERR }, { status: 401 });
  }

  const valid = verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: ERR }, { status: 401 });
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    return NextResponse.json({ ok: false, error: ERR }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, {
    userId: user.id,
    organizationId: membership.organizationId,
    role: membership.role,
  });
  return res;
}
