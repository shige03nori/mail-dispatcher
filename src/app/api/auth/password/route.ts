import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

// TODO: 自分のパスワード変更 API を実装する
//
// 仕様:
// - PATCH /api/auth/password
// - リクエスト: { currentPassword?: string, newPassword: string }
// - 未ログインなら 401
// - newPassword が 8 文字未満なら 400
// - 既存パスワードが設定されている場合:
//   - currentPassword がなければ 400
//   - verifyPassword() で照合し不一致なら 401
// - hashPassword(newPassword) で新しいハッシュを生成して保存
//
// ヒント:
// - user.passwordHash が null なら初回設定なので currentPassword のチェックをスキップする

export async function PATCH(req: Request) {
  throw new Error("TODO: PATCH /api/auth/password を実装してください");
}
