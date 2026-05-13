import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";

// TODO: 管理者によるユーザーパスワード設定 API を実装する
//
// 仕様:
// - PATCH /api/admin/users/{userId}/password
// - リクエスト: { password: string }
// - 未ログインまたは ADMIN でなければ 403
// - password が 8 文字未満なら 400
// - 同じ organizationId の membership を確認し、存在しなければ 404（組織外ユーザーへの操作を防ぐ）
// - hashPassword(password) でハッシュ化して保存
//
// ヒント:
// - params は Promise<{ userId: string }> なので const { userId } = await params; で取得
// - prisma.membership.findUnique({ where: { organizationId_userId: { organizationId, userId } } }) で確認

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  throw new Error("TODO: PATCH /api/admin/users/{userId}/password を実装してください");
}
