import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { isRateLimited } from "@/lib/auth/rateLimit";

// TODO: パスワードログイン API を実装する
//
// 仕様:
// - POST /api/auth/login
// - リクエスト: { email: string, password: string }
// - IP アドレスでレートリミットを適用する（15分間10回超で 429）
// - email でユーザーを取得し、passwordHash が設定されていなければ 401
// - verifyPassword() で検証し、不一致なら 401
// - membership を取得してセッション Cookie を発行し { ok: true } を返す
//
// ヒント:
// - req.headers.get("x-forwarded-for") で IP を取得
// - isRateLimited(`login:${ip}`) でリミット確認
// - setSessionCookie(res, { userId, organizationId, role }) でセッション付与
// - 認証失敗時のエラーメッセージは全て同じ文言（ユーザー存在の推測を防ぐため）

export async function POST(req: NextRequest) {
  throw new Error("TODO: POST /api/auth/login を実装してください");
}
