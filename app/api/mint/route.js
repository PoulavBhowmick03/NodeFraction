import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
export async function POST(request) {
  console.log("Mint API hit");
  try {
    const { purchaseId, transactionHash, contractAddress, tokenId } =
      await request.json();
    console.log("Received data in API:", {
      purchaseId,
      transactionHash,
      contractAddress,
      tokenId,
    });

    const result = await prisma.$transaction(async (prisma) => {
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { batch: { include: { purchases: true } } },
      });

      if (!purchase) {
        throw new Error("Purchase not found");
      }

      const updatedPurchase = await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          status: "completed",
          transactionHash,
          contractAddress,
          tokenId,
        },
      });

      const allCompleted = purchase.batch.purchases.every(
        (p) => p.status === "completed" || p.id === purchaseId
      );

      if (allCompleted) {
        await prisma.nodeLicense.create({
          data: {
            batchId: purchase.batchId,
            contractAddress,
            tokenId,
            chain: purchase.chainId.toString(),
          },
        });
        console.log("Created NodeLicense for batch:", purchase.batchId);
      }

      return { updatedPurchase };
    });

    console.log("Minting completed successfully");
    return NextResponse.json({
      message: "Minting recorded successfully",
      result,
    });
  } catch (error) {
    console.error("Failed to process minting:", error);
    return NextResponse.json(
      { error: "Failed to process minting", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
