import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { tableStyle } from "@/lib/ui/tableStyle";

export default async function ComposeResultPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const campaignId = sp.campaignId;
  if (!campaignId) redirect("/dashboard/contacts");

  const campaign = await prisma.emailCampaign.findFirst({
    where: {
      id: campaignId,
      organizationId: session.organizationId,
    },
    select: {
      id: true,
      status: true,
      subjectSnapshot: true,
      totalCount: true,
      sentCount: true,
      failedCount: true,
      skippedCount: true,
      createdAt: true,
      createdByUserId: true,
    },
  });

  if (!campaign) redirect("/dashboard/campaigns");

  const recipients = await prisma.emailCampaignRecipient.findMany({
    where: { campaignId: campaign.id },
    orderBy: { updatedAt: "desc" },
    take: 300,
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
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>送信結果</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/dashboard/campaigns"
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
          >
            履歴へ
          </Link>
          <Link
            href="/dashboard/contacts"
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
          >
            連絡先へ
          </Link>
        </div>
      </div>

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>status: <b>{campaign.status}</b></div>
          <div style={{ color: "#555" }}>{new Date(campaign.createdAt).toLocaleString("ja-JP")}</div>
        </div>

        <div style={{ marginTop: 8 }}>件名: <b>{campaign.subjectSnapshot}</b></div>

        <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span>合計: <b>{campaign.totalCount}</b></span>
          <span>送信: <b>{campaign.sentCount}</b></span>
          <span style={{ color: campaign.failedCount > 0 ? "#b91c1c" : "#111" }}>
            失敗: <b>{campaign.failedCount}</b>
          </span>
          <span>スキップ: <b>{campaign.skippedCount}</b></span>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          createdBy: {campaign.createdByUserId}
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>明細</h2>

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
                  <td style={{ padding: 10, whiteSpace: "nowrap", color: "#555" }}>
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

  if (status === "SENT")
    return <span style={{ ...base, background: "#e7f7ee", color: "#065f46" }}>SENT</span>;

  if (status === "FAILED")
    return <span style={{ ...base, background: "#fde2e2", color: "#7f1d1d" }}>FAILED</span>;

  if (status === "SKIPPED")
    return <span style={{ ...base, background: "#fff3cd", color: "#92400e" }}>SKIPPED</span>;

  if (status === "PENDING")
    return <span style={{ ...base, background: "#e0f2fe", color: "#075985" }}>PENDING</span>;

  return <span style={{ ...base, background: "#eee", color: "#333" }}>{status}</span>;
}
