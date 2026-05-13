import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { contactSchema } from "@/lib/schemas/contact";

// TODO: 連絡先の取得・更新・削除 API を実装する
//
// GET /api/contacts/{id}
// - 未ログインなら 401
// - organizationId スコープで取得し、見つからなければ 404
//
// PUT /api/contacts/{id}
// - 未ログインなら 401、VIEWER なら 403
// - organizationId スコープで存在確認し、見つからなければ 404
// - contactSchema でバリデーション → 失敗なら 400
// - prisma.contact.update() で更新（groups は JSON.stringify()）
//
// DELETE /api/contacts/{id}
// - 未ログインなら 401、VIEWER なら 403
// - organizationId スコープで存在確認し、見つからなければ 404
// - prisma.contact.delete() で削除
//
// ヒント:
// - ctx.params は Promise<{ id: string }> なので const { id } = await ctx.params; で取得

function parseGroups(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  throw new Error("TODO: GET /api/contacts/{id} を実装してください");
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  throw new Error("TODO: PUT /api/contacts/{id} を実装してください");
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  throw new Error("TODO: DELETE /api/contacts/{id} を実装してください");
}
