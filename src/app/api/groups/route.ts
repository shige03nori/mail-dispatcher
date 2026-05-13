import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// TODO: グループ一覧取得・新規作成 API を実装する
//
// GET /api/groups
// - 未ログインなら 401
// - 組織スコープでグループ一覧を名前順で取得して返す
//
// POST /api/groups
// - 未ログインなら 401、VIEWER なら 403
// - リクエストボディの name が空なら 400
// - 同じ組織内で name が重複していたら 409
// - prisma.contactGroup.create() で作成して返す

export async function GET() {
  throw new Error("TODO: GET /api/groups を実装してください");
}

export async function POST(req: Request) {
  throw new Error("TODO: POST /api/groups を実装してください");
}
