import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { isDemoAccount } from "@/lib/demo";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const body = await req.json().catch(() => null);
  const password = (body?.password ?? "").toString();

  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "パスワードは8文字以上で入力してください" },
      { status: 400 }
    );
  }

  // 同じ組織のユーザーか確認
  const membership = await prisma.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (targetUser && isDemoAccount(targetUser.email)) {
    return NextResponse.json(
      { ok: false, error: "デモアカウントのパスワードは変更できません" },
      { status: 403 }
    );
  }

  const passwordHash = hashPassword(password);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
