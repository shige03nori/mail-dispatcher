import crypto from "crypto";

// scrypt のパラメーター（変更しないこと）
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;

// TODO: パスワードをソルト付きでハッシュ化して "salt:hash" 形式の文字列を返す関数を実装する
// ヒント: crypto.randomBytes(16).toString("hex") でランダムなソルトを生成
// ヒント: crypto.scryptSync(password, salt, KEY_LEN, { N, r, p }) でハッシュ化
// ヒント: 戻り値は `${salt}:${hash}` の形式にする（DBに保存する文字列）
export function hashPassword(password: string): string {
  throw new Error("TODO: hashPassword を実装してください");
}

// TODO: 入力パスワードが保存済みハッシュと一致するか検証する関数を実装する
// ヒント: stored を ":" で分割して salt と storedHash を取り出す
// ヒント: 同じ salt・パラメーターで scryptSync してハッシュを再計算
// ヒント: crypto.timingSafeEqual() で比較する（普通の === はタイミング攻撃に脆弱）
export function verifyPassword(password: string, stored: string): boolean {
  throw new Error("TODO: verifyPassword を実装してください");
}
