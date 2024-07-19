/*
  Warnings:

  - You are about to drop the column `mintedQuantity` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the `Mint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Mint" DROP CONSTRAINT "Mint_purchaseId_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "mintedQuantity";

-- DropTable
DROP TABLE "Mint";
