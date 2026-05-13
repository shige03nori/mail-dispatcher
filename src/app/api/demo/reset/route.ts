import { NextResponse } from "next/server";

// デモ環境専用のリセット API（研修では実装不要）
export async function POST() {
  return NextResponse.json({ ok: false, error: "Not available" }, { status: 404 });
}
