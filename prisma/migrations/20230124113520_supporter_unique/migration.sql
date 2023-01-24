/*
  Warnings:

  - You are about to drop the column `userId` on the `Supporter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supporterId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Supporter" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "User_supporterId_key" ON "User"("supporterId");
