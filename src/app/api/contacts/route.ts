import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { contactSchema } from "@/lib/schemas/contact";

// TODO: 連絡先一覧取得・新規作成 API を実装する
//
// GET /api/contacts
// - 未ログインなら 401
// - 組織スコープ（organizationId: session.organizationId）で全連絡先を取得
// - groups フィールドは JSON 文字列なので JSON.parse() して配列に変換して返す
// - searchParams.groupId があれば、そのグループに属する連絡先のみ返す
//
// POST /api/contacts
// - 未ログインなら 401、VIEWER なら 403
// - contactSchema.safeParse() でバリデーション → 失敗なら 400
// - email が既存と重複していれば 409
// - prisma.contact.create() で保存（groups は JSON.stringify(groupIds) で保存）
//
// ヒント:
// - groups フィールドの読み書き: JSON.parse(c.groups) / JSON.stringify(groupIds)
// - 重複チェック: prisma.contact.findFirst({ where: { organizationId, email } })

function parseGroups(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export async function GET(req: Request) {
  throw new Error("TODO: GET /api/contacts を実装してください");
}

export async function POST(req: Request) {
  throw new Error("TODO: POST /api/contacts を実装してください");
}
