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
      emailSnapshot: true,
      contactNameSnapshot: true,
      status: true,
      errorMessage: true,
      providerMessageId: true,
      updatedAt: true,
    },
  });

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>キャンペーン詳細</h1>

        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/dashboard/campaigns"
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
          >
            一覧へ戻る
          </Link>
          <Link
            href={`/dashboard/compose/result?campaignId=${campaign.id}`}
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
          >
            送信結果ページ
          </Link>
        </div>
      </div>

      {/* サマリー */}
      <div style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14 }}>
            status: <b>{campaign.status}</b>
          </div>
          <div style={{ fontSize: 14, color: "#555" }}>
            作成: {new Date(campaign.createdAt).toLocaleString("ja-JP")}
          </div>
          <div style={{ fontSize: 14, color: "#555" }}>
            更新: {new Date(campaign.updatedAt).toLocaleString("ja-JP")}
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 14 }}>
          テンプレ: <b>{campaign.templateNameSnapshot ?? "-"}</b>
        </div>
        <div style={{ marginTop: 8, fontSize: 14 }}>
          件名: <b>{campaign.subjectSnapshot}</b>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 14 }}>
          <span>合計: <b>{campaign.totalCount}</b></span>
          <span>送信: <b>{campaign.sentCount}</b></span>
          <span style={{ color: campaign.failedCount > 0 ? "#b91c1c" : "#111" }}>
            失敗: <b>{campaign.failedCount}</b>
          </span>
          <span>スキップ: <b>{campaign.skippedCount}</b></span>
        </div>
      </div>

      {/* 本文スナップショット（必要なら折りたたみ） */}
      <details style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        <summary style={{ cursor: "pointer", fontWeight: 800 }}>本文スナップショット</summary>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13, color: "#333", marginBottom: 6 }}>text</div>
          <pre style={{ whiteSpace: "pre-wrap", background: "#fafafa", padding: 10, borderRadius: 8 }}>
            {campaign.textBodySnapshot}
          </pre>

          {campaign.htmlBodySnapshot && (
            <>
              <div style={{ fontSize: 13, color: "#333", marginTop: 10, marginBottom: 6 }}>html</div>
              <pre style={{ whiteSpace: "pre-wrap", background: "#fafafa", padding: 10, borderRadius: 8 }}>
                {campaign.htmlBodySnapshot}
              </pre>
            </>
          )}
        </div>
      </details>

      {/* recipients */}
      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>送信明細</h2>

        <div style={{ marginTop: 10, border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#fafafa" }}>
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
                  <td style={{ padding: 10, color: "#555", whiteSpace: "nowrap" }}>
                    {new Date(r.updatedAt).toLocaleString("ja-JP")}
                  </td>
                  <td style={{ padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                    {r.providerMessageId ?? ""}
                  </td>
                  <td style={{ padding: 10, color: r.status === "FAILED" ? "#b91c1c" : "#555" }}>
                    {r.errorMessage ?? ""}
                  </td>
                </tr>
              ))}

              {recipients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 12, color: "#666" }}>
                    明細がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
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
