import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, sha256 } from "@/lib/auth/token";
import { getSession } from "@/lib/auth/session";
import { invitationSchema } from "@/lib/schemas/invitation";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);

  const parsed = invitationSchema.safeParse(body ?? {});
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: firstIssue?.message ?? "validation_error" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const role = parsed.data.role;

  // 24時間有効
  const token = generateToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.invitation.create({
    data: {
      organizationId: session.organizationId,
      email,
      role,
      tokenHash,
      expiresAt,
      createdByUserId: session.userId,
    },
  });

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const acceptUrl = `${appUrl}/api/invitations/accept?token=${encodeURIComponent(token)}`;

  // 開発用：コンソールに出す（後でメール送信に差し替え）
  console.log("========================================");
  console.log("✉️ Invitation Link (DEV)");
  console.log("To:", email);
  console.log("Role:", role);
  console.log("URL:", acceptUrl);
  console.log("========================================");

  return NextResponse.json({ ok: true });
}
