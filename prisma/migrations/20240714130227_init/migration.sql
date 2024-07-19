/*
  Warnings:

  - Added the required column `contractAddress` to the `BatchInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BatchInfo" ADD COLUMN     "contractAddress" TEXT NOT NULL,
ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "transactionHash" TEXT;
