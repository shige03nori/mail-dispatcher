import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// TODO: グループ削除 API を実装する
//
// DELETE /api/groups/{id}
// - 未ログインなら 401、VIEWER なら 403
// - organizationId スコープで存在確認し、見つからなければ 404
// - prisma.contactGroup.delete() で削除して { ok: true } を返す
//
// ヒント:
// - ctx.params は Promise<{ id: string }> なので const { id } = await ctx.params;

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  throw new Error("TODO: DELETE /api/groups/{id} を実装してください");
}
