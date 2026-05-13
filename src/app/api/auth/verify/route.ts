import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth/token";
import { setSessionCookie } from "@/lib/auth/session";

// TODO: Magic Link 検証 API を実装する
//
// 仕様:
// - GET /api/auth/verify?token={token}
// - URL の token を sha256() でハッシュ化して DB の loginToken を検索する
// - 以下の場合はそれぞれエラーにリダイレクトする:
//   - トークンが見つからない → /login?e=invalid
//   - 既に使用済み（usedAt がある）→ /login?e=used
//   - 有効期限切れ（expiresAt < 現在時刻）→ /login?e=expired
// - 正常なら loginToken.usedAt を現在時刻で更新（使い捨て化）
// - membership を取得してセッション Cookie を発行し /dashboard へリダイレクト
//
// ヒント:
// - prisma.loginToken.findUnique({ where: { tokenHash }, include: { user: true } })
// - prisma.loginToken.update({ where: { id }, data: { usedAt: new Date() } })

export async function GET(req: Request) {
  throw new Error("TODO: GET /api/auth/verify を実装してください");
}
