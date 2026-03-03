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

/**
 * @returns true = 制限超過（429を返すべき）
 */
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}

/** テスト・シード用にリセット */
export function resetRateLimit(key: string) {
  store.delete(key);
}
