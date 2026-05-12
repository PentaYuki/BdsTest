import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const owner = await db.owner.findUnique({
      where: { id },
      include: {
        properties: {
          orderBy: { createdAt: 'desc' },
        },
        ownerTasks: {
          include: {
            task: true,
          },
          orderBy: { task: { dueDate: 'desc' } },
          take: 10,
        },
      },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    }

    return NextResponse.json({ data: owner });
  } catch (error) {
    console.error('Owner detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owner' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const owner = await db.owner.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        contactChannel: body.contactChannel || null,
        area: body.area || null,
        cooperationLevel: body.cooperationLevel,
        trustLevel: body.trustLevel,
        commissionPolicy: body.commissionPolicy || null,
        notes: body.notes || null,
        lastContact: body.lastContact ? new Date(body.lastContact) : undefined,
        nextUpdate: body.nextUpdate ? new Date(body.nextUpdate) : null,
      },
    });

    return NextResponse.json({ data: owner });
  } catch (error) {
    console.error('Update owner error:', error);
    return NextResponse.json(
      { error: 'Failed to update owner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.owner.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error('Delete owner error:', error);
    return NextResponse.json(
      { error: 'Failed to delete owner' },
      { status: 500 }
    );
  }
}
