import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Prisma } from "@prisma/client";
import { tableStyle } from "@/lib/ui/tableStyle";

const STATUS_OPTIONS = ["ALL", "DRAFT", "SENDING", "SENT", "FAILED"] as const;
type StatusOpt = (typeof STATUS_OPTIONS)[number];

function clampInt(v: string | undefined, def: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function safeStatus(v: string | undefined): StatusOpt {
  if (!v) return "ALL";
  const up = v.toUpperCase();
  return (STATUS_OPTIONS as readonly string[]).includes(up) ? (up as StatusOpt) : "ALL";
}

function parseDateOnly(v: string | undefined): Date | null {
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDaysUTC(d: Date, days: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function buildQS(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && v.trim() !== "") qs.set(k, v);
  }
  return qs.toString();
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: string;
    size?: string;
    failedFirst?: string; // "1"でON
    createdBy?: string;   // userId（完全一致）
    topN?: string;        // "1"で表示（FAILEDが多いorgだと重いので任意）
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const createdBy = (sp.createdBy ?? "").trim();
  const status = safeStatus(sp.status);
  const fromD = parseDateOnly(sp.from);
  const toD = parseDateOnly(sp.to);

  const page = clampInt(sp.page, 1, 1, 10_000);
  const size = clampInt(sp.size, 50, 10, 200);
  const skip = (page - 1) * size;

  const failedFirst = sp.failedFirst === "1";
  const showTopN = sp.topN === "1";

  // ---- where（orgスコープ + フィルタ）----
  const baseWhere: Prisma.EmailCampaignWhereInput = {
    organizationId: session.organizationId,
  };

  if (status !== "ALL") {
    baseWhere.status = status;
  }

  if (fromD || toD) {
    baseWhere.createdAt = {};
    if (fromD) baseWhere.createdAt.gte = fromD;
    if (toD) baseWhere.createdAt.lt = addDaysUTC(toD, 1);
  }

  if (createdBy) {
    baseWhere.createdByUserId = createdBy;
  }

  // qは subjectSnapshot と templateNameSnapshot を OR で検索
  if (q) {
    baseWhere.OR = [
      { subjectSnapshot: { contains: q } },
      { templateNameSnapshot: { contains: q } },
    ];
  }

  // ---- 件数（ページング用）----
  // failedFirstのときは「FAILEDセグメント + それ以外」2段構えにする（ページングを正しく保つため）
  let totalCount = 0;
  let failedCount = 0;
  let nonFailedCount = 0;

  if (failedFirst) {
    const failedWhere: Prisma.EmailCampaignWhereInput = {
      ...baseWhere,
      status: "FAILED",
    };
    const nonFailedWhere: Prisma.EmailCampaignWhereInput = {
      ...baseWhere,
      // statusフィルタが "ALL" のときだけ「FAILED以外」を作れる
      ...(status === "ALL" ? { NOT: { status: "FAILED" } } : {}),
    };

    // status が ALL 以外で failedFirst をONにすると矛盾するので、ALL以外なら通常ソート扱いに寄せる
    // （UI側でボタン無効化してもいい）
    if (status !== "ALL") {
      totalCount = await prisma.emailCampaign.count({ where: baseWhere });
    } else {
      [failedCount, nonFailedCount] = await Promise.all([
        prisma.emailCampaign.count({ where: failedWhere }),
        prisma.emailCampaign.count({ where: nonFailedWhere }),
      ]);
      totalCount = failedCount + nonFailedCount;
    }
  } else {
    totalCount = await prisma.emailCampaign.count({ where: baseWhere });
  }

  // ---- 一覧取得 ----
  type Row = {
    id: string;
    status: string;
    subjectSnapshot: string;
    templateNameSnapshot: string | null;
    totalCount: number;
    sentCount: number;
    failedCount: number;
    skippedCount: number;
    createdAt: Date;
    createdByUserId: string;
  };

  let campaigns: Row[] = [];

  if (!failedFirst || status !== "ALL") {
    // 通常ソート: createdAt desc
    campaigns = await prisma.emailCampaign.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      skip,
      take: size,
      select: {
        id: true,
        status: true,
        subjectSnapshot: true,
        templateNameSnapshot: true,
        totalCount: true,
        sentCount: true,
        failedCount: true,
        skippedCount: true,
        createdAt: true,
        createdByUserId: true,
      },
    });
  } else {
    // FAILED を先に並べる（ページング対応）
    const failedWhere: Prisma.EmailCampaignWhereInput = { ...baseWhere, status: "FAILED" };
    const nonFailedWhere: Prisma.EmailCampaignWhereInput = { ...baseWhere, NOT: { status: "FAILED" } };

    // skipがFAILEDセグメント内かどうかで分岐
    const inFailedSegment = skip < failedCount;

    if (inFailedSegment) {
      const takeFailed = Math.min(size, failedCount - skip);
      const takeNonFailed = size - takeFailed;

      const [failedRows, nonFailedRows] = await Promise.all([
        prisma.emailCampaign.findMany({
          where: failedWhere,
          orderBy: { createdAt: "desc" },
          skip,
          take: takeFailed,
          select: {
            id: true,
            status: true,
            subjectSnapshot: true,
            templateNameSnapshot: true,
            totalCount: true,
            sentCount: true,
            failedCount: true,
            skippedCount: true,
            createdAt: true,
            createdByUserId: true,
          },
        }),
        takeNonFailed > 0
          ? prisma.emailCampaign.findMany({
              where: nonFailedWhere,
              orderBy: { createdAt: "desc" },
              skip: 0,
              take: takeNonFailed,
              select: {
                id: true,
                status: true,
                subjectSnapshot: true,
                templateNameSnapshot: true,
                totalCount: true,
                sentCount: true,
                failedCount: true,
                skippedCount: true,
                createdAt: true,
                createdByUserId: true,
              },
            })
          : Promise.resolve([] as Row[]),
      ]);

      campaigns = [...failedRows, ...nonFailedRows];
    } else {
      // FAILED全部を飛ばして、nonFailed側でskipする
      const nonFailedSkip = skip - failedCount;

      campaigns = await prisma.emailCampaign.findMany({
        where: nonFailedWhere,
        orderBy: { createdAt: "desc" },
        skip: nonFailedSkip,
        take: size,
        select: {
          id: true,
          status: true,
          subjectSnapshot: true,
          templateNameSnapshot: true,
          totalCount: true,
          sentCount: true,
          failedCount: true,
          skippedCount: true,
          createdAt: true,
          createdByUserId: true,
        },
      });
    }
  }

  // ---- FAILED理由 TopN サマリー（任意表示）----
  // orgスコープで Recipient を groupBy
  const topN = 5;
  const failureTop =
    showTopN
      ? await prisma.emailCampaignRecipient.groupBy({
          by: ["errorMessage"],
          where: {
            status: "FAILED",
            errorMessage: { not: null },
            campaign: { organizationId: session.organizationId },
          },
          // _all ではなく id を数える（Prismaの型差異に強い）
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: topN,
        })
      : [];

  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  // 現在のクエリ保持（pageだけ差し替える）
  const baseQS = {
    q: q || undefined,
    status: status !== "ALL" ? status : undefined,
    from: sp.from || undefined,
    to: sp.to || undefined,
    size: String(size),
    failedFirst: failedFirst ? "1" : undefined,
    createdBy: createdBy || undefined,
    topN: showTopN ? "1" : undefined,
  };

  const clearHref = "/dashboard/campaigns";

  return (
    <main style={{ maxWidth: 1150, margin: "40px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>キャンペーン履歴</h1>

        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/dashboard/contacts"
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
          >
            連絡先
          </Link>
          <Link
            href={clearHref}
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
            title="フィルタ解除"
          >
            クリア
          </Link>
        </div>
      </div>

      {/* フィルタ */}
      <section style={{ marginTop: 16, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        <form action="/dashboard/campaigns" method="GET" style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 240px 240px", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>検索（件名 / テンプレ名）</label>
              <input
                name="q"
                defaultValue={q}
                placeholder="例: 案内、請求書、テスト"
                style={{ width: "100%", padding: 10 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>createdByUserId（完全一致）</label>
              <input
                name="createdBy"
                defaultValue={createdBy}
                placeholder="例: user_cuid..."
                style={{ width: "100%", padding: 10 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>status</label>
              <select name="status" defaultValue={status} style={{ width: "100%", padding: 10 }}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "200px 200px 160px 1fr", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>from</label>
              <input type="date" name="from" defaultValue={sp.from ?? ""} style={{ width: "100%", padding: 10 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>to</label>
              <input type="date" name="to" defaultValue={sp.to ?? ""} style={{ width: "100%", padding: 10 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#555" }}>page size</label>
              <select name="size" defaultValue={String(size)} style={{ width: "100%", padding: 10 }}>
                {[20, 50, 100, 200].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              {/* FAILED先頭トグル（status=ALLのときだけ本領発揮） */}
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#666" }}>
                <input type="checkbox" name="failedFirst" value="1" defaultChecked={failedFirst} />
                FAILEDを上に
                <span style={{ fontSize: 12, color: "#666" }}>（status=ALL推奨）</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#666" }}>
                <input type="checkbox" name="topN" value="1" defaultChecked={showTopN} />
                失敗理由Top表示
              </label>

              <button
                type="submit"
                style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 10, fontWeight: 800 }}
              >
                適用
              </button>
              <Link
                href={clearHref}
                style={{ padding: "10px 14px", color: "#111", border: "1px solid #ddd", borderRadius: 10, background: "#fafafa" }}
              >
                クリア
              </Link>
            </div>
          </div>
        </form>
      </section>

      {/* FAILED理由 TopN */}
      {showTopN && (
        <section style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          <div style={{ fontWeight: 800 }}>FAILED 失敗理由 Top {topN}</div>
          {failureTop.length === 0 ? (
            <div style={{ marginTop: 8, color: "#666" }}>失敗データがありません。</div>
          ) : (
            <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.8 }}>
              {failureTop.map((x) => (
                <li key={x.errorMessage ?? "null"}>
                  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                    {x.errorMessage ?? "(null)"}
                  </span>
                  <span style={{ marginLeft: 8, color: "#555" }}>
                    × {x._count?.id ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 一覧 */}
      <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              {["日時", "件名", "テンプレ", "status", "合計", "送信", "失敗", "スキップ", "createdBy"].map((h) => (
                <th key={h} style={tableStyle.th}>
                    {h}
                  </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #f2f2f2" }}>
                <td style={{ padding: 10, whiteSpace: "nowrap", color: "#555" }}>
                  {new Date(c.createdAt).toLocaleString("ja-JP")}
                </td>
                <td style={{ padding: 10 }}>
                  <Link
                    href={`/dashboard/campaigns/${c.id}`}
                    style={{ textDecoration: "underline", color: "#111", fontWeight: 700 }}
                  >
                    {c.subjectSnapshot}
                  </Link>
                </td>
                <td style={{ padding: 10, color: "#555" }}>{c.templateNameSnapshot ?? "-"}</td>
                <td style={{ padding: 10 }}>
                  <StatusBadge status={c.status} />
                </td>
                <td style={{ padding: 10 }}>{c.totalCount}</td>
                <td style={{ padding: 10 }}>{c.sentCount}</td>
                <td style={{ padding: 10, color: c.failedCount > 0 ? "#b91c1c" : "#111" }}>{c.failedCount}</td>
                <td style={{ padding: 10 }}>{c.skippedCount}</td>
                <td style={{ padding: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "#555" }}>
                  {c.createdByUserId}
                </td>
              </tr>
            ))}

            {campaigns.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 12, color: "#666" }}>
                  該当するキャンペーンがありません（条件を変えてみてください）
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ページング */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 13, color: "#666" }}>
          表示: {campaigns.length}件 / 全{totalCount}件 / page {page} of {totalPages}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {prevPage ? (
            <Link
              href={`/dashboard/campaigns?${buildQS({ ...baseQS, page: String(prevPage) })}`}
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
            >
              ← 前へ
            </Link>
          ) : (
            <span style={{ padding: "8px 12px", color: "#aaa" }}>← 前へ</span>
          )}

          {nextPage ? (
            <Link
              href={`/dashboard/campaigns?${buildQS({ ...baseQS, page: String(nextPage) })}`}
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
            >
              次へ →
            </Link>
          ) : (
            <span style={{ padding: "8px 12px", color: "#aaa" }}>次へ →</span>
          )}
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
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
