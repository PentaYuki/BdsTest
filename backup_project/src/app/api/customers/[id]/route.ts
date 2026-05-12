import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, role: true } },
        interactions: {
          orderBy: { date: 'desc' },
          take: 20,
        },
        propertyViews: {
          include: {
            property: { select: { id: true, code: true, title: true, price: true, demand: true, propertyType: true, area: true } },
          },
          orderBy: { date: 'desc' },
        },
        dealCustomers: {
          include: {
            deal: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        taskCustomers: {
          include: {
            task: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ data: customer });
  } catch (error) {
    console.error('Customer detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
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

    const customer = await db.customer.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        zalo: body.zalo || null,
        whatsapp: body.whatsapp || null,
        nationality: body.nationality,
        language: body.language,
        type: body.type,
        demand: body.demand,
        propertyType: body.propertyType || null,
        areaInterest: body.areaInterest || null,
        budget: body.budget || null,
        timeframe: body.timeframe || null,
        heatLevel: body.heatLevel,
        source: body.source || null,
        assignedTo: body.assignedTo || null,
        notes: body.notes || null,
        lastContact: body.lastContact ? new Date(body.lastContact) : undefined,
        nextFollowUp: body.nextFollowUp ? new Date(body.nextFollowUp) : null,
        status: body.status,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ data: customer });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
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

    await db.customer.delete({ where: { id } });

    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
