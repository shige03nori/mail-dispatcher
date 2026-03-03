import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isDemoAccount } from "@/lib/demo";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => null);
  const currentPassword = (body?.currentPassword ?? "").toString();
  const newPassword = (body?.newPassword ?? "").toString();

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { ok: false, error: "パスワードは8文字以上で入力してください" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  if (isDemoAccount(user.email)) {
    return NextResponse.json(
      { ok: false, error: "デモアカウントのパスワードは変更できません" },
      { status: 403 }
    );
  }

  // 既存パスワードが設定されている場合は現在のパスワードを確認
  if (user.passwordHash) {
    if (!currentPassword) {
      return NextResponse.json(
        { ok: false, error: "現在のパスワードを入力してください" },
        { status: 400 }
      );
    }
    const valid = verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "現在のパスワードが正しくありません" },
        { status: 401 }
      );
    }
  }

  const passwordHash = hashPassword(newPassword);
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
