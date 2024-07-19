import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get('batchId');

  try {
    let batchInfo;

    if (batchId) {
      batchInfo = await prisma.batch.findUnique({
        where: { id: parseInt(batchId) },
        include: {
          purchases: {
            select: {
              id: true,
              userId: true,
              quantity: true,
              totalCost: true,
              status: true,
              fractionId: true,
              chainId: true,
              contractAddress: true,
              tokenId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!batchInfo) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
      }
    } else {
      batchInfo = await prisma.batch.findMany({
        include: {
          purchases: {
            select: {
              id: true,
              userId: true,
              quantity: true,
              totalCost: true,
              status: true,
              fractionId: true,
              chainId: true,
              contractAddress: true,
              tokenId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    }

    const processedBatchInfo = Array.isArray(batchInfo) ? batchInfo : [batchInfo];
    const result = processedBatchInfo.map(batch => ({
      ...batch,
      totalPurchases: batch.purchases.length,
      totalQuantity: batch.purchases.reduce((sum, purchase) => sum + purchase.quantity, 0),
      totalCost: batch.purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0),
      completedPurchases: batch.purchases.filter(purchase => purchase.status === 'completed').length,
    }));

    return NextResponse.json(batchId ? result[0] : result);
  } catch (error) {
    console.error('Failed to fetch batch information:', error);
    return NextResponse.json({ error: 'Failed to fetch batch information' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}