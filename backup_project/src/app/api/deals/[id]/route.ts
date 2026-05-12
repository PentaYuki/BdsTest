import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deal = await db.deal.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, role: true } },
        dealCustomers: {
          include: {
            customer: { select: { id: true, name: true, code: true, phone: true, email: true } },
          },
        },
        dealProperties: {
          include: {
            property: {
              select: { id: true, code: true, title: true, price: true, area: true, address: true },
            },
          },
        },
        dealDocs: true,
        dealTasks: {
          include: {
            task: true,
          },
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ data: deal });
  } catch (error) {
    console.error('Deal detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
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

    const deal = await db.deal.update({
      where: { id },
      data: {
        type: body.type,
        value: body.value !== undefined ? body.value : undefined,
        expectedCommission: body.expectedCommission !== undefined ? body.expectedCommission : undefined,
        actualCommission: body.actualCommission !== undefined ? body.actualCommission : undefined,
        stage: body.stage,
        expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : undefined,
        risk: body.risk !== undefined ? body.risk : undefined,
        nextStep: body.nextStep !== undefined ? body.nextStep : undefined,
        assignedTo: body.assignedTo !== undefined ? body.assignedTo : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
        dealCustomers: {
          include: {
            customer: { select: { id: true, name: true, code: true } },
          },
        },
        dealProperties: {
          include: {
            property: { select: { id: true, code: true, title: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: deal });
  } catch (error) {
    console.error('Update deal error:', error);
    return NextResponse.json(
      { error: 'Failed to update deal' },
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
    await db.deal.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error('Delete deal error:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
