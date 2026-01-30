import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth/token";
import { setSessionCookie } from "@/lib/auth/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = (searchParams.get("token") ?? "").trim();

  if (!token) return NextResponse.redirect(new URL("/login?e=invalid", req.url));

  const tokenHash = sha256(token);

  const loginToken = await prisma.loginToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!loginToken) return NextResponse.redirect(new URL("/login?e=invalid", req.url));
  if (loginToken.usedAt) return NextResponse.redirect(new URL("/login?e=used", req.url));
  if (loginToken.expiresAt.getTime() < Date.now())
    return NextResponse.redirect(new URL("/login?e=expired", req.url));

  // 使い捨て化
  await prisma.loginToken.update({
    where: { id: loginToken.id },
    data: { usedAt: new Date() },
  });

  const membership = await prisma.membership.findFirst({
    where: { userId: loginToken.userId },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) return NextResponse.redirect(new URL("/login?e=nomember", req.url));

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  setSessionCookie(res, {
    userId: loginToken.userId,
    organizationId: membership.organizationId,
    role: membership.role,
  });
  return res;
}
