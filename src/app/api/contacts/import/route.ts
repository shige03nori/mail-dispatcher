import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

// TODO: 連絡先 CSV インポート API を実装する
//
// 仕様:
// - POST /api/contacts/import（multipart/form-data で file フィールドに CSV を受け取る）
// - 未ログインなら 401、VIEWER なら 403
// - CSV フォーマット（1行目: ヘッダー）: name,email,phone,companyName,note,groups
//   - groups はパイプ区切りのグループ名（例: "営業|VIP"）
// - name が空の行はスキップして errors に記録する
// - email が既存と重複する行はスキップして errors に記録する
// - groups の名前はDBから ID に変換する（存在しないグループ名は無視）
// - 戻り値: { ok: true, created: N, skipped: M, errors: [...] }
//
// ヒント:
// - req.formData() でフォームデータを取得し、file フィールドを File として取り出す
// - BOM 除去: text.replace(/^﻿/, "")
// - 改行の正規化: text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
// - CSV のクォート対応（"," を含むセルは "" でエスケープ）はパーサー関数を自前実装する

export async function POST(req: NextRequest) {
  throw new Error("TODO: POST /api/contacts/import を実装してください");
}
