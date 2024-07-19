import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function POST(request) {
  console.log("Purchase API hit");
  try {
    const { userId, quantity, chainId } = await request.json();
    console.log("Received data:", { userId, quantity, chainId });

    const FRACTION_PRICE = 0.005; 
    const PLATFORM_FEE = 0.002;
    const totalCost = quantity * (FRACTION_PRICE + PLATFORM_FEE);

    console.log("Calculated total cost:", totalCost);

    let batch = await prisma.batch.findFirst({
      where: { isFull: false },
      include: { purchases: true },
    });

    if (!batch || batch.purchases.length + quantity > 10) {
      batch = await prisma.batch.create({ data: {} });
    }

    console.log("Using batch:", batch.id);

    const startingFractionId = batch.purchases.reduce((sum, purchase) => sum + purchase.quantity, 0) + 1;

    const purchase = await prisma.purchase.create({
      data: {
        userId,
        quantity,
        totalCost,
        status: 'pending',
        batchId: batch.id,
        fractionId: startingFractionId,
        chainId,
      },
    });

    console.log("Created purchase:", purchase);

    const updatedBatch = await prisma.batch.findUnique({
      where: { id: batch.id },
      include: { purchases: true },
    });

    if (updatedBatch.purchases.reduce((sum, p) => sum + p.quantity, 0) === 10) {
      await prisma.batch.update({
        where: { id: batch.id },
        data: { isFull: true },
      });
      console.log("Batch is now full");
    }

    return NextResponse.json({ 
      purchaseId: purchase.id, 
      totalCost, 
      batchId: batch.id,
      chainId 
    });
  } catch (error) {
    console.error('Failed to create purchase:', error);
    return NextResponse.json({ error: 'Failed to create purchase', details: error.message }, { status: 500 });
  }
}