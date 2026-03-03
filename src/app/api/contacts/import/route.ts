import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

/** CSVの1行をパース（クォート対応） */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; } // エスケープ
        else inQuote = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ",") { result.push(current); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (session.role === "VIEWER")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  let text: string;
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string")
      return NextResponse.json({ ok: false, error: "file_required" }, { status: 400 });
    text = await (file as File).text();
  } catch {
    return NextResponse.json({ ok: false, error: "parse_error" }, { status: 400 });
  }

  // BOM 除去・改行正規化
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((l) => l.trim());

  if (lines.length < 2)
    return NextResponse.json({ ok: false, error: "empty_file" }, { status: 400 });

  // ヘッダー行を確認
  const header = lines[0].toLowerCase();
  if (!header.includes("name"))
    return NextResponse.json({ ok: false, error: "invalid_header" }, { status: 400 });

  // グループ名→IDのマップを取得
  const existingGroups = await prisma.contactGroup.findMany({
    where: { organizationId: session.organizationId },
  });
  const groupNameMap = new Map(existingGroups.map((g) => [g.name, g.id]));

  // 既存メールアドレスを取得（重複チェック用）
  const existingContacts = await prisma.contact.findMany({
    where: { organizationId: session.organizationId },
    select: { email: true },
  });
  const existingEmails = new Set(existingContacts.map((c) => c.email?.toLowerCase()).filter(Boolean));

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const [name, email, phone, companyName, note, groupsRaw] = cols;

    const trimmedName = (name ?? "").trim();
    if (!trimmedName) { errors.push(`行${i + 1}: 氏名が空です`); skipped++; continue; }

    const trimmedEmail = (email ?? "").trim().toLowerCase() || null;
    if (trimmedEmail && existingEmails.has(trimmedEmail)) {
      errors.push(`行${i + 1}: メール「${trimmedEmail}」は既に登録済みのためスキップ`);
      skipped++;
      continue;
    }

    // グループ名からIDを解決（存在しないグループは無視）
    const groupIds = (groupsRaw ?? "")
      .split("|")
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => groupNameMap.get(n))
      .filter((id): id is string => id !== undefined);

    await prisma.contact.create({
      data: {
        organizationId: session.organizationId,
        name: trimmedName,
        email: trimmedEmail,
        phone: (phone ?? "").trim() || null,
        companyName: (companyName ?? "").trim() || null,
        note: (note ?? "").trim() || null,
        groups: JSON.stringify(groupIds),
        createdByUserId: session.userId,
        updatedByUserId: session.userId,
      },
    });

    if (trimmedEmail) existingEmails.add(trimmedEmail);
    created++;
  }

  return NextResponse.json({ ok: true, created, skipped, errors });
}
