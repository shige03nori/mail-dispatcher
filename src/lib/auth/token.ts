import crypto from "crypto";

// TODO: URLセーフなランダムトークンを生成する関数を実装する
// ヒント: crypto.randomBytes(32) でランダムバイト列を生成し、.toString("base64url") でエンコード
// ヒント: base64url はURLに載せても "=" や "+" が含まれないため安全
export function generateToken(): string {
  throw new Error("TODO: generateToken を実装してください");
}

// TODO: 文字列を SHA-256 でハッシュ化して16進数文字列を返す関数を実装する
// ヒント: crypto.createHash("sha256").update(input).digest("hex")
// ヒント: トークンをDBに保存する際は必ずこの関数でハッシュ化して保存する（生トークンは保存しない）
export function sha256(input: string): string {
  throw new Error("TODO: sha256 を実装してください");
}
