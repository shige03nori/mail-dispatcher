import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const COOKIE_NAME = "md_session";

type SessionPayload = {
  userId: string;
  organizationId: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  exp: number; // epoch ms
};

// TODO: SESSION_SECRET 環境変数を取得して検証する関数を実装する
// ヒント: process.env.SESSION_SECRET を読み、32文字未満なら Error をスロー
function requireSecret(): string {
  throw new Error("TODO: requireSecret を実装してください");
}

// TODO: ペイロードを HMAC-SHA256 で署名して base64url 文字列を返す関数を実装する
// ヒント: crypto.createHmac("sha256", requireSecret()).update(data).digest("base64url")
function sign(data: string): string {
  throw new Error("TODO: sign を実装してください");
}

// TODO: SessionPayload を「base64url(JSON).署名」形式の文字列にエンコードする関数を実装する
// ヒント: JSON.stringify → Buffer.toString("base64url") でデータ部分を作り、sign() と "." で連結
function encode(payload: SessionPayload): string {
  throw new Error("TODO: encode を実装してください");
}

// TODO: エンコードされた文字列を検証してデコードする関数を実装する
// ヒント: "data.sig" の形式に分割し、sign(data) === sig を確認してから JSON.parse
// ヒント: payload.exp を Date.now() と比較して期限切れなら null を返す
function decode(value: string): SessionPayload | null {
  throw new Error("TODO: decode を実装してください");
}

// TODO: NextResponse の Cookie にセッションを書き込む関数を実装する
// ヒント: encode() でトークンを作り、res.cookies.set(COOKIE_NAME, value, { httpOnly: true, ... })
// ヒント: secure は本番環境(NODE_ENV === "production")のみ true にする
export function setSessionCookie(
  res: NextResponse,
  payload: Omit<SessionPayload, "exp">,
  maxAgeSeconds = 60 * 60 * 12
) {
  throw new Error("TODO: setSessionCookie を実装してください");
}

// TODO: Cookie のセッションを削除する関数を実装する
// ヒント: res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 })
export function clearSessionCookie(res: NextResponse) {
  throw new Error("TODO: clearSessionCookie を実装してください");
}

// TODO: Cookie からセッションを取得して返す async 関数を実装する
// ヒント: const store = await cookies(); でCookieストアを取得
// ヒント: store.get(COOKIE_NAME)?.value を decode() に渡して返す
export async function getSession(): Promise<SessionPayload | null> {
  throw new Error("TODO: getSession を実装してください");
}
