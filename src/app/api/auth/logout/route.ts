import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

// TODO: ログアウト API を実装する
//
// 仕様:
// - POST /api/auth/logout
// - clearSessionCookie() でセッション Cookie を削除する
// - /login にリダイレクトする
//
// ヒント:
// - NextResponse.redirect(new URL("/login", req.url)) でリダイレクトレスポンスを作る
// - clearSessionCookie(res) でCookieを削除してから return res

export async function POST(req: Request) {
  throw new Error("TODO: POST /api/auth/logout を実装してください");
}
