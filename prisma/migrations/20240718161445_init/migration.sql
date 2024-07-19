/*
  Warnings:

  - You are about to drop the `BatchInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `batchId` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chainId` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fractionId` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "batchId" INTEGER NOT NULL,
ADD COLUMN     "chainId" INTEGER NOT NULL,
ADD COLUMN     "contractAddress" TEXT,
ADD COLUMN     "fractionId" INTEGER NOT NULL,
ADD COLUMN     "tokenId" INTEGER;

-- DropTable
DROP TABLE "BatchInfo";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Batch" (
    "id" SERIAL NOT NULL,
    "isFull" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeLicense" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "chain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NodeLicense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NodeLicense_batchId_key" ON "NodeLicense"("batchId");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
