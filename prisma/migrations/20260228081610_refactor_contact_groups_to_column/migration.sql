/*
  Warnings:

  - You are about to drop the `ContactGroupMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "ContactGroupMember_contactId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ContactGroupMember";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "note" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "updatedByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "groups" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Contact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contact_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contact_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Contact" ("companyName", "createdAt", "createdByUserId", "email", "id", "name", "note", "organizationId", "phone", "updatedAt", "updatedByUserId") SELECT "companyName", "createdAt", "createdByUserId", "email", "id", "name", "note", "organizationId", "phone", "updatedAt", "updatedByUserId" FROM "Contact";
DROP TABLE "Contact";
ALTER TABLE "new_Contact" RENAME TO "Contact";
CREATE INDEX "Contact_organizationId_idx" ON "Contact"("organizationId");
CREATE INDEX "Contact_email_idx" ON "Contact"("email");
CREATE INDEX "Contact_phone_idx" ON "Contact"("phone");
CREATE INDEX "Contact_companyName_idx" ON "Contact"("companyName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
