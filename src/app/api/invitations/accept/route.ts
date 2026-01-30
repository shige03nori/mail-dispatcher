import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth/token";
import { setSessionCookie } from "@/lib/auth/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = (searchParams.get("token") ?? "").trim();

  if (!token) return NextResponse.redirect(new URL("/login?e=invalid_invite", req.url));

  const tokenHash = sha256(token);

  const invite = await prisma.invitation.findUnique({
    where: { tokenHash },
  });

  if (!invite) return NextResponse.redirect(new URL("/login?e=invalid_invite", req.url));
  if (invite.acceptedAt) return NextResponse.redirect(new URL("/login?e=invite_used", req.url));
  if (invite.expiresAt.getTime() < Date.now())
    return NextResponse.redirect(new URL("/login?e=invite_expired", req.url));

  // User を用意（既存ならそれを使う、なければ作る）
  const user = await prisma.user.upsert({
    where: { email: invite.email },
    update: {},
    create: {
      email: invite.email,
      status: "ACTIVE",
    },
  });

  // Membership を作る（既存ならrole更新）
  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: invite.organizationId,
        userId: user.id,
      },
    },
    update: { role: invite.role },
    create: {
      organizationId: invite.organizationId,
      userId: user.id,
      role: invite.role,
    },
  });

  // 使い捨て化
  await prisma.invitation.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });

  // ログイン（セッション付与）
  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  setSessionCookie(res, {
    userId: user.id,
    organizationId: invite.organizationId,
    role: invite.role,
  });
  return res;
}
