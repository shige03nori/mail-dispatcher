import { CampaignStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { processCampaign } from "@/lib/email/processCampaign";

let started = false;

/**
 * 予約送信スケジューラ。
 * Next.js の instrumentation.ts から起動時に1回だけ呼ぶ。
 * 1分ごとに scheduledAt <= now の SCHEDULED キャンペーンを処理する。
 */
export function startScheduler() {
  if (started) return;
  started = true;

  console.log("[scheduler] 起動しました（1分ごとに予約送信をチェック）");

  // 起動直後に1回チェック（サーバー再起動後すぐに実行されるべき予約があるケースに対応）
  runScheduledCampaigns().catch((err) =>
    console.error("[scheduler] 起動時チェックエラー:", err)
  );

  setInterval(() => {
    runScheduledCampaigns().catch((err) =>
      console.error("[scheduler] ポーリングエラー:", err)
    );
  }, 60 * 1000);
}

async function runScheduledCampaigns() {
  const now = new Date();

  const campaigns = await prisma.emailCampaign.findMany({
    where: {
      status: CampaignStatus.SCHEDULED,
      scheduledAt: { lte: now },
    },
    select: { id: true, subjectSnapshot: true },
  });

  if (campaigns.length === 0) return;

  console.log(`[scheduler] ${campaigns.length}件の予約キャンペーンを処理します`);

  for (const c of campaigns) {
    // SCHEDULED → SENDING に変更（重複処理防止）
    const { count } = await prisma.emailCampaign.updateMany({
      where: { id: c.id, status: CampaignStatus.SCHEDULED },
      data: { status: CampaignStatus.SENDING },
    });

    if (count === 0) {
      // 他のプロセスが先に処理済み
      continue;
    }

    console.log(`[scheduler] キャンペーン送信開始: ${c.subjectSnapshot} (${c.id})`);

    processCampaign(c.id).catch((err) => {
      console.error(`[scheduler] キャンペーン ${c.id} 送信エラー:`, err);
      prisma.emailCampaign
        .update({ where: { id: c.id }, data: { status: CampaignStatus.FAILED } })
        .catch(() => {});
    });
  }
}
