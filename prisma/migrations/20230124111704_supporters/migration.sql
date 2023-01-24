-- AlterTable
ALTER TABLE "User" ADD COLUMN     "supporterId" INTEGER;

-- CreateTable
CREATE TABLE "Supporter" (
    "id" SERIAL NOT NULL,
    "patronId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Supporter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_supporterId_fkey" FOREIGN KEY ("supporterId") REFERENCES "Supporter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
