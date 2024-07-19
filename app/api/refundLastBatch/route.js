import prisma from '@/utils/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const incompleteBatches = await prisma.batch.findMany({
      where: { isFull: false },
      include: {
        purchases: {
          select: {
            userId: true,
            totalCost: true,
          },
        },
      },
    });

    let refunds = [];

    for (const batch of incompleteBatches) {
      const refundUser = batch.purchases.reduce((acc, purchase) => {
        if (!acc[purchase.userId]) {
          acc[purchase.userId] = 0;
        }
        acc[purchase.userId] += purchase.totalCost;
        return acc;
      }, {});

      for (const [userId, amount] of Object.entries(refundUser)) {
        refunds.push({
          batchId: batch.id,
          userId,
          amount,
        });
      }
    }

    return NextResponse.json({ 
      message: 'Refund information for incomplete batches',
      refunds,
    });
  } catch (error) {
    console.error('Failed to process refund information:', error);
  } finally {
    await prisma.$disconnect();
  }
}