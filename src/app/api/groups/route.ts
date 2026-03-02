import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const groups = await prisma.contactGroup.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ ok: true, groups });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (session.role === "VIEWER")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").toString().trim();
  if (!name) return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });

  const dup = await prisma.contactGroup.findFirst({
    where: { organizationId: session.organizationId, name },
  });
  if (dup) return NextResponse.json({ ok: false, error: "name_already_exists" }, { status: 409 });

  const group = await prisma.contactGroup.create({
    data: { organizationId: session.organizationId, name },
  });

  return NextResponse.json({ ok: true, group });
}
