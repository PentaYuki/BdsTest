import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const view = await db.propertyView.create({
      data: {
        propertyId: id,
        customerId: body.customerId,
        feedback: body.feedback || null,
        date: body.date ? new Date(body.date) : new Date(),
      },
      include: {
        customer: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json({ data: view }, { status: 201 });
  } catch (error) {
    console.error('Create property view error:', error);
    return NextResponse.json(
      { error: 'Failed to create property view' },
      { status: 500 }
    );
  }
}
