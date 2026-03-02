import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (session.role === "VIEWER")
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  const group = await prisma.contactGroup.findFirst({
    where: { id, organizationId: session.organizationId },
  });
  if (!group) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await prisma.contactGroup.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
