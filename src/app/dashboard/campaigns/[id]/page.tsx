import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { tableStyle } from "@/lib/ui/tableStyle";

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const campaign = await prisma.emailCampaign.findFirst({
    where: {
      id: params.id,
      organizationId: session.organizationId,
    },
    select: {
      id: true,
      status: true,
      scheduledAt: true,
      templateNameSnapshot: true,
      subjectSnapshot: true,
      textBodySnapshot: true,
      htmlBodySnapshot: true,
      totalCount: true,
      sentCount: true,
      failedCount: true,
      skippedCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!campaign) redirect("/dashboard/campaigns");

  const recipients = await prisma.emailCampaignRecipient.findMany({
    where: { campaignId: campaign.id },
    orderBy: [
      { status: "asc" },      // PENDING→SENT→FAILED→SKIPPED みたいにしたい場合はenum順に依存。気になるなら後でカスタムソート
      { updatedAt: "desc" },
    ],
    take: 300, // MVP
    select: {
      id: true,
      contactId: true,
      emailSnapshot: true,
      contactNameSnapshot: true,
      status: true,
      errorMessage: true,
      providerMessageId: true,
      updatedAt: true,
    },
  });

  const canEdit = session.role !== "VIEWER";
  // 再送信用: メールアドレスがある宛先のcontactIdを収集
  const resendIds = recipients
    .filter((r) => r.contactId && r.emailSnapshot)
    .map((r) => r.contactId as string)
    .filter((id, i, arr) => arr.indexOf(id) === i); // 重複除去

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: "16px 16px 16px 64px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>キャンペーン詳細</h1>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/dashboard/campaigns" className="btn-custom01 btn-custom01-secondary">
            一覧へ戻る
          </Link>
          <Link
            href={`/dashboard/compose/result?campaignId=${campaign.id}`}
            className="btn-custom01 btn-custom01-secondary"
          >
            送信結果
          </Link>
          {canEdit && resendIds.length > 0 && (
            <Link
              href={`/dashboard/compose?ids=${encodeURIComponent(resendIds.join(","))}&from=${campaign.id}`}
              className="btn-custom01 btn-custom01-primary"
            >
              再送信
            </Link>
          )}
        </div>
      </div>

      {/* サマリー */}
      <div style={{ marginTop: 16, padding: 12, border: "1px solid #333", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14 }}>
            status: <b>{campaign.status}</b>
          </div>
          <div style={{ fontSize: 14, color: "#aaa" }}>
            作成: {new Date(campaign.createdAt).toLocaleString("ja-JP")}
          </div>
          <div style={{ fontSize: 14, color: "#aaa" }}>
            更新: {new Date(campaign.updatedAt).toLocaleString("ja-JP")}
          </div>
        </div>

        {campaign.scheduledAt && (
          <div style={{ marginTop: 8, fontSize: 14 }}>
            予約日時: <b>{new Date(campaign.scheduledAt).toLocaleString("ja-JP")}</b>
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 14 }}>
          テンプレ: <b>{campaign.templateNameSnapshot ?? "-"}</b>
        </div>
        <div style={{ marginTop: 8, fontSize: 14 }}>
          件名: <b>{campaign.subjectSnapshot}</b>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 14 }}>
          <span>合計: <b>{campaign.totalCount}</b></span>
          <span>送信: <b>{campaign.sentCount}</b></span>
          <span style={{ color: campaign.failedCount > 0 ? "#f87171" : "inherit" }}>
            失敗: <b>{campaign.failedCount}</b>
          </span>
          <span>スキップ: <b>{campaign.skippedCount}</b></span>
        </div>
      </div>

      {/* 本文スナップショット（必要なら折りたたみ） */}
      <details style={{ marginTop: 16, padding: 12, border: "1px solid #333", borderRadius: 10 }}>
        <summary style={{ cursor: "pointer", fontWeight: 800 }}>本文スナップショット</summary>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 6 }}>text</div>
          <pre style={{ whiteSpace: "pre-wrap", background: "#1a1a1a", color: "#fff", padding: 10, borderRadius: 8 }}>
            {campaign.textBodySnapshot}
          </pre>

          {campaign.htmlBodySnapshot && (
            <>
              <div style={{ fontSize: 13, color: "#aaa", marginTop: 10, marginBottom: 6 }}>html</div>
              <pre style={{ whiteSpace: "pre-wrap", background: "#1a1a1a", color: "#fff", padding: 10, borderRadius: 8 }}>
                {campaign.htmlBodySnapshot}
              </pre>
            </>
          )}
        </div>
      </details>

      {/* recipients */}
      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>送信明細</h2>

        <div className="table-scroll-wrap" style={{ marginTop: 10, border: "1px solid #ddd", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
            <thead style={{ background: "#fff" }}>
              <tr>
                {["宛先", "名前", "状態", "更新", "messageId", "エラー"].map((h) => (
                  <th key={h} style={tableStyle.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid #f2f2f2" }}>
                  <td style={{ padding: 10 }}>{r.emailSnapshot ?? "-"}</td>
                  <td style={{ padding: 10 }}>{r.contactNameSnapshot ?? "-"}</td>
                  <td style={{ padding: 10 }}>
                    <RecipientBadge status={r.status} />
                  </td>
                  <td style={{ padding: 10, color: "#aaa", whiteSpace: "nowrap" }}>
                    {new Date(r.updatedAt).toLocaleString("ja-JP")}
                  </td>
                  <td style={{ padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                    {r.providerMessageId ?? ""}
                  </td>
                  <td style={{ padding: 10, color: r.status === "FAILED" ? "#f87171" : "#aaa" }}>
                    {r.errorMessage ?? ""}
                  </td>
                </tr>
              ))}

              {recipients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 12, color: "#aaa" }}>
                    明細がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: "#aaa" }}>
          ※ まずは最大300件表示。大量配信するならページング/フィルタを追加するのがおすすめ。
        </p>
      </section>
    </main>
  );
}

function RecipientBadge({ status }: { status: string }) {
  const base: React.CSSProperties = {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    display: "inline-block",
  };

  if (status === "SENT") return <span style={{ ...base, background: "#e7f7ee" }}>SENT</span>;
  if (status === "FAILED") return <span style={{ ...base, background: "#fde2e2" }}>FAILED</span>;
  if (status === "SKIPPED") return <span style={{ ...base, background: "#fff3cd" }}>SKIPPED</span>;
  if (status === "PENDING") return <span style={{ ...base, background: "#e0f2fe" }}>PENDING</span>;
  return <span style={{ ...base, background: "#eee" }}>{status}</span>;
}
