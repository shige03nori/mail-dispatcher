import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

type Body = {
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  note?: string;
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, contacts });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (session.role === "VIEWER")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as Body | null;

  const name = (body?.name ?? "").trim();
  const companyName = (body?.companyName ?? "").trim() || null;
  const email = (body?.email ?? "").trim().toLowerCase() || null;
  const phone = (body?.phone ?? "").trim() || null;
  const note = (body?.note ?? "").trim() || null;

  if (!name) return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });

  // （B方針）emailが入力されている場合だけ重複チェック（任意）
  if (email) {
    const dup = await prisma.contact.findFirst({
      where: { organizationId: session.organizationId, email },
    });
    if (dup) {
      return NextResponse.json({ ok: false, error: "email_already_exists" }, { status: 409 });
    }
  }

  const created = await prisma.contact.create({
    data: {
      organizationId: session.organizationId,
      name,
      companyName,
      email,
      phone,
      note,
      createdByUserId: session.userId,
      updatedByUserId: session.userId,
    },
  });

  return NextResponse.json({ ok: true, contact: created });
}
