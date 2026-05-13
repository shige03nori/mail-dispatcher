import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, sha256 } from "@/lib/auth/token";
import { getSession } from "@/lib/auth/session";
import { invitationSchema } from "@/lib/schemas/invitation";

// TODO: ユーザー招待リンク発行 API を実装する
//
// POST /api/invitations/create
// - リクエスト: { email: string, role: "VIEWER" | "EDITOR" }
// - 未ログインまたは ADMIN でなければ 403
// - invitationSchema でバリデーション → 失敗なら 400
// - generateToken() でトークンを生成し、sha256() でハッシュ化（有効期限24時間）
// - prisma.invitation.create() でDBに保存
// - 開発環境ではコンソールに招待URLを出力する（後でメール送信に差し替え予定）
//   フォーマット: ${APP_URL}/api/invitations/accept?token={token}
//
// ヒント:
// - ADMIN のみが招待を作れるため、session.role !== "ADMIN" なら 403
// - invitationSchema.safeParse(body) でバリデーション

export async function POST(req: Request) {
  throw new Error("TODO: POST /api/invitations/create を実装してください");
}
