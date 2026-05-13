import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth/token";
import { setSessionCookie } from "@/lib/auth/session";

// TODO: 招待リンク承認 API を実装する
//
// GET /api/invitations/accept?token={token}
// - URL の token を sha256() でハッシュ化して DB の invitation を検索する
// - 以下の場合はエラーにリダイレクトする:
//   - トークンが見つからない → /login?e=invalid_invite
//   - 既に使用済み（acceptedAt がある）→ /login?e=invite_used
//   - 有効期限切れ → /login?e=invite_expired
// - 正常なら:
//   1. invite.email でユーザーを upsert（存在すればそのまま、なければ作成）
//   2. membership を upsert（存在すれば role を更新、なければ作成）
//   3. invitation.acceptedAt を現在時刻で更新（使い捨て化）
//   4. セッション Cookie を発行して /dashboard へリダイレクト
//
// ヒント:
// - prisma.user.upsert({ where: { email }, update: {}, create: { email, status: "ACTIVE" } })
// - prisma.membership.upsert({ where: { organizationId_userId: { organizationId, userId } }, update: { role }, create: { ... } })

export async function GET(req: Request) {
  throw new Error("TODO: GET /api/invitations/accept を実装してください");
}
