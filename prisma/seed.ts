import { PrismaClient, Role, UserStatus } from "@prisma/client";
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // ===== 設定値 =====
  const organizationName = "Mail Dispatcher Company";
  const adminEmail = "shige03nori@gmail.com";
  const adminName = "Shige";

  console.log("🌱 Seeding started...");

  // ===== Organization =====
  const organization = await prisma.organization.upsert({
    where: { name: organizationName },
    update: {},
    create: {
      name: organizationName,
    },
  });

  console.log("✅ Organization:", organization.name);

  // ===== User (Admin) =====
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      status: UserStatus.ACTIVE,
    },
  });

  console.log("✅ Admin User:", user.email);

  // ===== Membership (ADMIN) =====
  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id,
      },
    },
    update: {
      role: Role.ADMIN,
    },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Membership: ADMIN");

  console.log("🌱 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
