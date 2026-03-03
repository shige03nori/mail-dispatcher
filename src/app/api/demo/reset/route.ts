import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";

const DEMO_ORG_NAME = "デモ組織";

const CONTACTS_DATA = [
  {
    name: "山田 太郎",
    companyName: "ヤマダテクノ株式会社",
    email: "yamada@yamada.example",
    phone: "090-1234-5678",
  },
  {
    name: "鈴木 花子",
    companyName: "スズキコーポレーション",
    email: "hanako@suzuki.example",
    phone: "080-2345-6789",
  },
  {
    name: "田中 次郎",
    companyName: "田中工業株式会社",
    email: "jiro@tanaka.example",
    phone: "070-3456-7890",
  },
  {
    name: "佐藤 美咲",
    companyName: "佐藤ホールディングス",
    email: "misaki@sato.example",
    phone: "090-4567-8901",
  },
  {
    name: "伊藤 健太",
    companyName: "ITOソリューションズ",
    email: "kenta@ito.example",
    phone: "080-5678-9012",
  },
];

export async function POST() {
  if (!isDemoMode) {
    return NextResponse.json({ ok: false, error: "Not available" }, { status: 404 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const org = await prisma.organization.findFirst({ where: { name: DEMO_ORG_NAME } });
  if (!org || org.id !== session.organizationId) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  // 組織データをリセット（ユーザー・メンバーシップは保持）
  await prisma.emailCampaign.deleteMany({ where: { organizationId: org.id } });
  await prisma.campaign.deleteMany({ where: { organizationId: org.id } });
  await prisma.emailTemplate.deleteMany({ where: { organizationId: org.id } });
  await prisma.template.deleteMany({ where: { organizationId: org.id } });
  await prisma.contact.deleteMany({ where: { organizationId: org.id } });
  await prisma.contactGroup.deleteMany({ where: { organizationId: org.id } });

  const adminUser = await prisma.user.findFirst({
    where: { email: "admin@demo.example" },
  });
  if (!adminUser) {
    return NextResponse.json({ ok: true, message: "データをリセットしました" });
  }

  // グループ再作成
  const group1 = await prisma.contactGroup.create({
    data: { organizationId: org.id, name: "採用候補者" },
  });
  const group2 = await prisma.contactGroup.create({
    data: { organizationId: org.id, name: "取引先" },
  });

  // 連絡先再作成（グループ割り当てつき）
  const groupMap = [
    [group1.id],
    [group2.id],
    [group1.id],
    [group2.id],
    [group1.id, group2.id],
  ];
  for (let i = 0; i < CONTACTS_DATA.length; i++) {
    const c = CONTACTS_DATA[i];
    await prisma.contact.create({
      data: {
        organizationId: org.id,
        name: c.name,
        companyName: c.companyName,
        email: c.email,
        phone: c.phone,
        groups: JSON.stringify(groupMap[i]),
        createdByUserId: adminUser.id,
      },
    });
  }

  // メールテンプレート再作成
  await prisma.emailTemplate.create({
    data: {
      organizationId: org.id,
      name: "採用面接ご案内",
      subject: "【採用ご連絡】面接のご案内",
      textBody: `{name} 様\n\nお世話になっております。\nこの度は弊社の採用選考にご応募いただき、誠にありがとうございます。\n\n書類選考の結果、面接にお進みいただくことになりましたので、\n下記の日程でご来社いただけますでしょうか。\n\n■ 日時：調整中\n■ 場所：弊社本社（別途ご案内いたします）\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nどうぞよろしくお願いいたします。`,
      createdByUserId: adminUser.id,
      updatedByUserId: adminUser.id,
    },
  });
  await prisma.emailTemplate.create({
    data: {
      organizationId: org.id,
      name: "新サービスご紹介",
      subject: "【ご案内】新サービスのご紹介",
      textBody: `{name} 様\n\n平素より大変お世話になっております。\n\nこの度、弊社では新しいサービスを開始いたしましたのでご案内申し上げます。\n\n■ サービス名：Mail Dispatcher\n■ 概要：メール配信管理を効率化するツールです\n\nご興味をお持ちいただけましたら、お気軽にご連絡ください。\n\nどうぞよろしくお願いいたします。`,
      createdByUserId: adminUser.id,
      updatedByUserId: adminUser.id,
    },
  });

  return NextResponse.json({ ok: true, message: "デモデータをリセットしました" });
}
