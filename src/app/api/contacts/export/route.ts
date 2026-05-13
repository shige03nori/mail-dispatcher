import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

// TODO: 連絡先 CSV エクスポート API を実装する
//
// 仕様:
// - GET /api/contacts/export
// - 未ログインなら 401
// - 組織スコープで連絡先を全件取得し、CSV 形式で返す
// - CSV のカラム順: name,email,phone,companyName,note,groups
// - groups は「グループ名1|グループ名2」のようにパイプ区切りで結合する
// - グループ名を引き引くには contactGroup テーブルから ID→名前マップを作る
// - ファイル名: contacts_{YYYY-MM-DD}.csv
//
// ヒント:
// - カンマや改行を含むセルはダブルクォートで囲む（RFC 4180準拠）
//   例: csvCell(value) = value.includes(",") ? `"${value.replace(/"/g, '""')}"` : value
// - レスポンスヘッダーに Content-Type: text/csv; charset=utf-8 と Content-Disposition を設定する
// - new Response(csv, { headers: {...} }) で返す

export async function GET() {
  throw new Error("TODO: GET /api/contacts/export を実装してください");
}
