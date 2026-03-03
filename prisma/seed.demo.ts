import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import crypto from "crypto";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 })
    .toString("hex");
  return `${salt}:${hash}`;
}

const ORG_NAME = "デモ組織";
const DEMO_PASSWORD = "demo1234";

const ACCOUNTS = [
  { email: "admin@demo.example", name: "デモ管理者", role: Role.ADMIN },
  { email: "editor@demo.example", name: "デモ編集者", role: Role.EDITOR },
  { email: "viewer@demo.example", name: "デモ閲覧者", role: Role.VIEWER },
] as const;

async function main() {
  console.log("🌱 Demo seeding started...");

  // Organization
  const org = await prisma.organization.upsert({
    where: { name: ORG_NAME },
    update: {},
    create: { name: ORG_NAME },
  });
  console.log("✅ Organization:", org.name);

  // Users + Memberships
  const users: { id: string; email: string; role: Role }[] = [];
  for (const account of ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        status: UserStatus.ACTIVE,
        passwordHash: hashPassword(DEMO_PASSWORD),
      },
      create: {
        email: account.email,
        name: account.name,
        status: UserStatus.ACTIVE,
        passwordHash: hashPassword(DEMO_PASSWORD),
      },
    });
    await prisma.membership.upsert({
      where: {
        organizationId_userId: { organizationId: org.id, userId: user.id },
      },
      update: { role: account.role },
      create: { organizationId: org.id, userId: user.id, role: account.role },
    });
    users.push({ id: user.id, email: user.email, role: account.role });
    console.log(`✅ User: ${user.email} (${account.role})`);
  }

  const adminUser = users.find((u) => u.role === Role.ADMIN)!;

  // ContactGroups
  const group1 = await prisma.contactGroup.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "採用候補者" } },
    update: {},
    create: { organizationId: org.id, name: "採用候補者" },
  });
  const group2 = await prisma.contactGroup.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "取引先" } },
    update: {},
    create: { organizationId: org.id, name: "取引先" },
  });
  console.log("✅ ContactGroups: 採用候補者, 取引先");

  // Contacts
  const contactsData = [
    {
      name: "山田 太郎",
      companyName: "ヤマダテクノ株式会社",
      email: "yamada@yamada.example",
      phone: "090-1234-5678",
      groups: [group1.id],
    },
    {
      name: "鈴木 花子",
      companyName: "スズキコーポレーション",
      email: "hanako@suzuki.example",
      phone: "080-2345-6789",
      groups: [group2.id],
    },
    {
      name: "田中 次郎",
      companyName: "田中工業株式会社",
      email: "jiro@tanaka.example",
      phone: "070-3456-7890",
      groups: [group1.id],
    },
    {
      name: "佐藤 美咲",
      companyName: "佐藤ホールディングス",
      email: "misaki@sato.example",
      phone: "090-4567-8901",
      groups: [group2.id],
    },
    {
      name: "伊藤 健太",
      companyName: "ITOソリューションズ",
      email: "kenta@ito.example",
      phone: "080-5678-9012",
      groups: [group1.id, group2.id],
    },
  ];

  for (const c of contactsData) {
    const existing = await prisma.contact.findFirst({
      where: { organizationId: org.id, email: c.email },
    });
    if (!existing) {
      await prisma.contact.create({
        data: {
          organizationId: org.id,
          name: c.name,
          companyName: c.companyName,
          email: c.email,
          phone: c.phone,
          groups: JSON.stringify(c.groups),
          createdByUserId: adminUser.id,
        },
      });
    }
  }
  console.log("✅ Contacts: 5件");

  // EmailTemplates
  const templates = [
    {
      name: "採用面接ご案内",
      subject: "【採用ご連絡】面接のご案内",
      textBody: `{name} 様\n\nお世話になっております。\nこの度は弊社の採用選考にご応募いただき、誠にありがとうございます。\n\n書類選考の結果、面接にお進みいただくことになりましたので、\n下記の日程でご来社いただけますでしょうか。\n\n■ 日時：調整中\n■ 場所：弊社本社（別途ご案内いたします）\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nどうぞよろしくお願いいたします。`,
    },
    {
      name: "新サービスご紹介",
      subject: "【ご案内】新サービスのご紹介",
      textBody: `{name} 様\n\n平素より大変お世話になっております。\n\nこの度、弊社では新しいサービスを開始いたしましたのでご案内申し上げます。\n\n■ サービス名：Mail Dispatcher\n■ 概要：メール配信管理を効率化するツールです\n\nご興味をお持ちいただけましたら、お気軽にご連絡ください。\n\nどうぞよろしくお願いいたします。`,
    },
  ];

  for (const t of templates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { organizationId: org.id, name: t.name },
    });
    if (!existing) {
      await prisma.emailTemplate.create({
        data: {
          organizationId: org.id,
          name: t.name,
          subject: t.subject,
          textBody: t.textBody,
          createdByUserId: adminUser.id,
          updatedByUserId: adminUser.id,
        },
      });
    }
  }
  console.log("✅ EmailTemplates: 2件");

  console.log("\n🎉 Demo seeding completed!");
  console.log("\n📋 ログイン情報:");
  for (const account of ACCOUNTS) {
    console.log(`   ${account.role.padEnd(6)}: ${account.email} / ${DEMO_PASSWORD}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
