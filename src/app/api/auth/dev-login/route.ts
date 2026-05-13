import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth/session";

// 開発・研修専用のバイパスログイン（本番環境では無効）
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Not available" }, { status: 404 });
  }

  const membership = await prisma.membership.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    return NextResponse.json(
      { ok: false, error: "管理者ユーザーが見つかりません。npm run seed を実行してください。" },
      { status: 404 }
    );
  }

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, {
    userId: membership.userId,
    organizationId: membership.organizationId,
    role: membership.role,
  });
  return res;
}
