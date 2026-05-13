/**
 * インメモリレートリミット（開発・研修環境向け）
 * 本番移行時は Redis 等に変更すること。
 */

interface Entry {
  count: number;
  resetAt: number; // ms timestamp
}

const store = new Map<string, Entry>();

const WINDOW_MS = 15 * 60 * 1000; // 15分
const MAX_REQUESTS = 10;

// TODO: キー（IPアドレス等）ごとに15分間で10回を超えたら true を返す関数を実装する
// ヒント: store.get(key) でエントリを取得し、なければ { count: 1, resetAt: now + WINDOW_MS } で初期化
// ヒント: entry.resetAt < now なら期限切れなのでリセット
// ヒント: entry.count を+1して MAX_REQUESTS を超えたら true を返す
/**
 * @returns true = 制限超過（429を返すべき）
 */
export function isRateLimited(key: string): boolean {
  throw new Error("TODO: isRateLimited を実装してください");
}

/** テスト用にリセット */
export function resetRateLimit(key: string) {
  store.delete(key);
}
