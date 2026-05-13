import { CampaignStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { processCampaign } from "@/lib/email/processCampaign";

let started = false;

// TODO: 予約送信スケジューラーを実装する
//
// 仕様:
// - started フラグで二重起動を防ぐ
// - 起動直後に1回 runScheduledCampaigns() を実行する
// - その後は setInterval() で60秒おきに実行し続ける
//
// ヒント: Next.js の instrumentation.ts から起動時に1回だけ呼ばれる
export function startScheduler() {
  if (started) return;
  started = true;

  console.log("[scheduler] 起動しました（1分ごとに予約送信をチェック）");

  // TODO: 起動直後に1回実行し、その後は1分ごとに繰り返す
  // ヒント: runScheduledCampaigns().catch(...) で起動直後チェック
  // ヒント: setInterval(() => runScheduledCampaigns().catch(...), 60 * 1000) で定期実行
  console.log("[scheduler] TODO: スケジューラーが未実装のためスキップします");
}

// TODO: scheduledAt が現在時刻以前の SCHEDULED キャンペーンを取得して送信する関数を実装する
//
// 処理の流れ:
// 1. status が SCHEDULED かつ scheduledAt <= now のキャンペーンを取得する
// 2. 各キャンペーンを SCHEDULED → SENDING にステータス更新する（updateMany で競合防止）
//    - count === 0 なら他プロセスが処理済みなのでスキップ
// 3. processCampaign(campaignId) で送信処理を実行する
//
// ヒント: prisma.emailCampaign.findMany({ where: { status: SCHEDULED, scheduledAt: { lte: now } } })
// ヒント: processCampaign() は非同期で実行し、失敗時は status を FAILED に更新する
async function runScheduledCampaigns() {
  // TODO: scheduledAt が現在時刻以前の SCHEDULED キャンペーンを取得して送信する
  // （startScheduler を実装すると自動的に呼ばれるようになります）
}
