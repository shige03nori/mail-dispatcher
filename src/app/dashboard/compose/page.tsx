import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { tableStyle } from "@/lib/ui/tableStyle";
import { buttonStyle } from "@/lib/ui/buttonStyle";

function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "send failed";
  }
}

function parseIdsParam(idsParam?: string): string[] {
  if (!idsParam) return [];
  const parts = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const p of parts) {
    if (!seen.has(p)) {
      seen.add(p);
      unique.push(p);
    }
  }
  return unique.slice(0, 500);
}

// 超ミニ差し込み: {{name}} {{companyName}} {{email}} {{phone}}
// 必要になったら増やせばOK
function applyVars(template: string, c: { name: string; companyName: string | null; email: string | null; phone: string | null }) {
  return template
    .replaceAll("{{name}}", c.name ?? "")
    .replaceAll("{{companyName}}", c.companyName ?? "")
    .replaceAll("{{email}}", c.email ?? "")
    .replaceAll("{{phone}}", c.phone ?? "");
}

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; templateId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const canSend = session.role !== "VIEWER";
  if (!canSend) redirect("/dashboard/contacts");

  const sp = await searchParams;

  const ids = parseIdsParam(sp.ids);
  if (ids.length === 0) redirect("/dashboard/contacts");

  // orgスコープで引き直し（URL改ざん対策）
  const contacts = await prisma.contact.findMany({
    where: {
      organizationId: session.organizationId,
      id: { in: ids },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      phone: true,
    },
  });

  const foundIds = new Set(contacts.map((c) => c.id));
  const missingIds = ids.filter((id) => !foundIds.has(id));

  const withEmail = contacts.filter((c) => !!c.email);
  const noEmail = contacts.filter((c) => !c.email);

  // テンプレ一覧（有効のみ）
  const templates = await prisma.emailTemplate.findMany({
    where: { organizationId: session.organizationId, isArchived: false },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      subject: true,
      textBody: true,
      htmlBody: true,
      updatedAt: true,
    },
    take: 200,
  });

  // 選択中テンプレ
  const templateId = sp.templateId || "";
  const selectedTemplate = templateId
    ? await prisma.emailTemplate.findFirst({
        where: { id: templateId, organizationId: session.organizationId, isArchived: false },
        select: { id: true, name: true, subject: true, textBody: true, htmlBody: true },
      })
    : null;

  // プレビュー用の subject/body 初期値（テンプレがあれば反映、無ければ空）
  const subjectDefault = selectedTemplate?.subject ?? "";
  const textBodyDefault = selectedTemplate?.textBody ?? "";
  const htmlBodyDefault = selectedTemplate?.htmlBody ?? "";

  // --- Server Action: 送信 ---
  async function sendAction(formData: FormData) {
    "use server";

    const session2 = await getSession();
    if (!session2) redirect("/login");
    if (session2.role === "VIEWER") redirect("/dashboard/contacts");

    const idsParam = String(formData.get("ids") ?? "");
    const ids2 = parseIdsParam(idsParam);
    if (ids2.length === 0) redirect("/dashboard/contacts");

    const templateId2 = String(formData.get("templateId") ?? "") || null;
    const subject = String(formData.get("subject") ?? "").trim();
    const textBody = String(formData.get("textBody") ?? "");
    const htmlBody = String(formData.get("htmlBody") ?? "") || null;

    if (!subject) {
      redirect(`/dashboard/compose?ids=${encodeURIComponent(ids2.join(","))}&templateId=${encodeURIComponent(templateId2 ?? "")}&err=subject`);
    }
    if (!textBody.trim()) {
      redirect(`/dashboard/compose?ids=${encodeURIComponent(ids2.join(","))}&templateId=${encodeURIComponent(templateId2 ?? "")}&err=body`);
    }

    // orgスコープで再度引き直し（Action側でも必須）
    const contacts2 = await prisma.contact.findMany({
      where: {
        organizationId: session2.organizationId,
        id: { in: ids2 },
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        phone: true,
      },
    });

    // テンプレ名スナップショット（orgスコープ＆アーカイブ除外）
    const templateNameSnapshot = templateId2
      ? (await prisma.emailTemplate.findFirst({
          where: { id: templateId2, organizationId: session2.organizationId, isArchived: false },
          select: { name: true },
        }))?.name ?? null
      : null;

    // Campaign作成（スナップショット保存）
    const campaign = await prisma.emailCampaign.create({
      data: {
        organizationId: session2.organizationId,
        templateId: templateId2,
        templateNameSnapshot,
        subjectSnapshot: subject,
        textBodySnapshot: textBody,
        htmlBodySnapshot: htmlBody,
        status: "SENDING",
        createdByUserId: session2.userId,
      },
      select: { id: true },
    });

    // Recipient 明細を作る（emailSnapshot重要）
    const recipientsData = contacts2.map((c) => {
      const email = c.email?.trim() || null;
      const contactName = c.name ?? "";
      if (!email) {
        return {
          campaignId: campaign.id,
          contactId: c.id,
          emailSnapshot: null,
          contactNameSnapshot: contactName,
          status: "SKIPPED" as const,
          errorMessage: "email is missing",
        };
      }
      return {
        campaignId: campaign.id,
        contactId: c.id,
        emailSnapshot: email,
        contactNameSnapshot: contactName,
        status: "PENDING" as const,
        errorMessage: null,
      };
    });

    // createMany（SQLiteでもOK）
    await prisma.emailCampaignRecipient.createMany({
      data: recipientsData,
    });

    // 送信対象だけ取得（PENDINGのみ）
    const pending = await prisma.emailCampaignRecipient.findMany({
      where: { campaignId: campaign.id, status: "PENDING" },
      select: {
        id: true,
        emailSnapshot: true,
        contactNameSnapshot: true,
        contactId: true,
      },
    });

    // contactの差し込みデータ用に map
    const contactMap = new Map(contacts2.map((c) => [c.id, c]));

    let sentCount = 0;
    let failedCount = 0;
    const skippedCount = recipientsData.filter((r) => r.status === "SKIPPED").length;

    for (const r of pending) {
      const email = r.emailSnapshot!;
      const c = r.contactId ? contactMap.get(r.contactId) : undefined;

      // 差し込み反映
      const subjRendered = c ? applyVars(subject, c) : subject;
      const textRendered = c ? applyVars(textBody, c) : textBody;
      const htmlRendered = htmlBody ? (c ? applyVars(htmlBody, c) : htmlBody) : undefined;

      try {
        const info = await sendEmail({
          to: email,
          subject: subjRendered,
          text: textRendered,
          html: htmlRendered,
        });

        await prisma.emailCampaignRecipient.update({
          where: { id: r.id },
          data: {
            status: "SENT",
            providerMessageId: info.messageId,
            errorMessage: null,
          },
        });

        sentCount++;
      } catch (e: unknown) {
        await prisma.emailCampaignRecipient.update({
          where: { id: r.id },
          data: {
            status: "FAILED",
            errorMessage: toErrorMessage(e),
          },
        });
        failedCount++;
      }
    }

    // Campaign集計更新 & status確定
    const totalCount = recipientsData.length;
    const finalStatus = failedCount > 0 ? "FAILED" : "SENT";

    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: finalStatus,
        totalCount,
        sentCount,
        failedCount,
        skippedCount,
      },
    });

    // リダイレクト先（campaign詳細ページが無いなら、とりあえずcomposeへ結果クエリでもOK）
    redirect(`/dashboard/compose/result?campaignId=${campaign.id}`);
  }

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>メール作成</h1>
        <Link
          href="/dashboard/contacts"
          style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
        >
          連絡先へ戻る
        </Link>
      </div>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        <div style={{ fontSize: 14 }}>
          選択: <b>{ids.length}</b>件 / 取得: <b>{contacts.length}</b>件
          <span style={{ marginLeft: 8, color: "#666" }}>
            （送信可能: {withEmail.length} / メールなし: {noEmail.length}）
          </span>
        </div>
        {missingIds.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#b45309" }}>
            ※ 組織外または存在しないIDが含まれていたため、{missingIds.length}件は除外しました。
          </div>
        )}
      </div>

      {/* テンプレ選択（GETでプレビュー反映） */}
      <section style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>テンプレ</h2>

        {templates.length === 0 ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ color: "#666" }}>
              テンプレがまだありません（先に作成してください）
            </div>
            <div style={{ marginTop: 10 }}>
              <Link
                href="/dashboard/templates/new"
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontWeight: 800,
                  color: "#111",
                  background: "#fafafa",
                }}
              >
                テンプレを作成
              </Link>
            </div>
          </div>
        ) : (
          <form action="/dashboard/compose" method="GET" style={{ marginTop: 10 }}>
            <label style={{ display: "block", fontSize: 13, color: "#333" }}>テンプレ選択</label>
            <select
              name="templateId"
              defaultValue={templateId}
              style={{ width: "100%", padding: 10, marginTop: 6 }}
            >
              <option value="">選択してください</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}（件名: {t.subject}）
                </option>
              ))}
            </select>
            <input type="hidden" name="ids" value={ids.join(",")} />
            <div style={{ marginTop: 10 }}>
              <button type="submit" style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}>
                プレビューに反映
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 送信フォーム（Server Action） */}
      <section style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>内容</h2>

        <form action={sendAction} style={{ marginTop: 10, display: "grid", gap: 10 }}>
          <input type="hidden" name="ids" value={ids.join(",")} />
          <input type="hidden" name="templateId" value={templateId} />

          <label style={{ fontSize: 13 }}>件名</label>
          <input name="subject" defaultValue={subjectDefault} style={{ width: "100%", padding: 10 }} />

          <label style={{ fontSize: 13 }}>
            本文（text）{" "}
            <span style={{ color: "#666" }}>
              ※差し込み例: {"{{name}}"} / {"{{companyName}}"}
            </span>
          </label>
          <textarea
            name="textBody"
            defaultValue={textBodyDefault}
            rows={10}
            style={{ width: "100%", padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
          />

          {/* HTMLを使いたくなったらON（今は隠してもOK） */}
          <details>
            <summary style={{ cursor: "pointer", color: "#333" }}>HTML本文（任意）</summary>
            <textarea
              name="htmlBody"
              defaultValue={htmlBodyDefault}
              rows={10}
              style={{ width: "100%", padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            />
          </details>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
            <button
              type="submit"
              style={{
                ...buttonStyle.base,
                ...buttonStyle.primary,
              }}
            >
              送信する（{withEmail.length}件）
            </button>
            <span style={{ fontSize: 12, color: "#666" }}>
              メール未設定の{noEmail.length}件は自動でスキップしてログに残ります
            </span>
          </div>
        </form>
      </section>

      {/* 宛先プレビュー */}
      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800 }}>宛先</h2>
        <div style={{ marginTop: 10, border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#fafafa" }}>
              <tr>
                {["氏名", "会社", "メール", "電話", "状態"].map((h) => (
                  <th key={h} style={tableStyle.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => {
                const ok = !!c.email;
                return (
                  <tr key={c.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{c.name}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{c.companyName ?? ""}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>
                      {c.email ?? <span style={{ color: "#777" }}>（未設定）</span>}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{c.phone ?? ""}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>
                      {ok ? (
                        <span style={{ padding: "2px 8px", borderRadius: 999, background: "#e7f7ee", fontSize: 12 }}>
                          送信対象
                        </span>
                      ) : (
                        <span style={{ padding: "2px 8px", borderRadius: 999, background: "#fff3cd", fontSize: 12 }}>
                          スキップ（メールなし）
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 12, color: "#666" }}>
                    宛先がありません
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
