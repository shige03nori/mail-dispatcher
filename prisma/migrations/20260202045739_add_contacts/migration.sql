/*
  Warnings:

  - A unique constraint covering the columns `[organizationId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Contact_organizationId_email_key";

-- CreateIndex
CREATE INDEX "Contact_companyName_idx" ON "Contact"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_organizationId_key" ON "Contact"("organizationId");
