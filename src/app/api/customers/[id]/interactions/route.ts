import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { customerId: id };
    if (type) where.type = type;

    const [interactions, total] = await Promise.all([
      db.interaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      db.interaction.count({ where }),
    ]);

    return NextResponse.json({
      data: interactions,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('List interactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const interaction = await db.interaction.create({
      data: {
        customerId: id,
        type: body.type,
        content: body.content,
        date: body.date ? new Date(body.date) : new Date(),
      },
    });

    // Update customer lastContact
    await db.customer.update({
      where: { id },
      data: { lastContact: new Date() },
    });

    return NextResponse.json({ data: interaction }, { status: 201 });
  } catch (error) {
    console.error('Create interaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create interaction' },
      { status: 500 }
    );
  }
}
