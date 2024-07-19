-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "mintedQuantity" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Mint" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mint_purchaseId_key" ON "Mint"("purchaseId");

-- AddForeignKey
ALTER TABLE "Mint" ADD CONSTRAINT "Mint_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
