import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, sha256 } from "@/lib/auth/token";
import { sendMagicLink } from "@/lib/mail";
import { isRateLimited } from "@/lib/auth/rateLimit";

// TODO: Magic Link 発行 API を実装する
//
// 仕様:
// - POST /api/auth/request-link
// - リクエスト: { email: string }
// - IP アドレスでレートリミットを適用する（制限時もユーザー存在を漏らさないよう { ok: true } を返す）
// - メールアドレスでユーザーを検索し、存在しない場合は何もせず { ok: true } を返す
//   （列挙攻撃対策: ユーザーの存在有無を応答に含めない）
// - generateToken() でトークンを生成し、sha256() でハッシュ化してDBに保存（有効期限15分）
// - sendMagicLink(email, url) で Magic Link を送信する
//
// ヒント:
// - prisma.loginToken.create({ data: { userId, tokenHash, expiresAt } }) で保存
// - URL は `${process.env.APP_URL}/api/auth/verify?token=${encodeURIComponent(token)}`

export async function POST(req: NextRequest) {
  throw new Error("TODO: POST /api/auth/request-link を実装してください");
}
