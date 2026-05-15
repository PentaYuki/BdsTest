import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const type = searchParams.get('type');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (stage) {
      // Support comma-separated stages
      const stages = stage.split(',');
      where.stage = stages.length === 1 ? stage : { in: stages };
    }
    if (type) where.type = type;
    if (assignedTo) where.assignedTo = assignedTo;
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const [deals, total] = await Promise.all([
      db.deal.findMany({
        where,
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
          expectedCommission: true,
          actualCommission: true,
          stage: true,
          expectedCloseDate: true,
          risk: true,
          nextStep: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, name: true, role: true } },
          dealCustomers: {
            select: {
              customer: { select: { id: true, name: true, code: true, phone: true } },
            },
          },
          dealProperties: {
            select: {
              property: { select: { id: true, code: true, title: true, price: true, area: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.deal.count({ where }),
    ]);

    return NextResponse.json({
      data: deals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Deals list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Auto-generate code
    const lastDeal = await db.deal.findFirst({
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    let nextNum = 1;
    if (lastDeal?.code) {
      const num = parseInt(lastDeal.code.replace('GD-', ''));
      if (!isNaN(num)) nextNum = num + 1;
    }
    const code = `GD-${String(nextNum).padStart(3, '0')}`;

    const deal = await db.deal.create({
      data: {
        code,
        type: body.type || 'sell',
        value: body.value || null,
        expectedCommission: body.expectedCommission || null,
        actualCommission: body.actualCommission || null,
        stage: body.stage || 'new_lead',
        expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null,
        risk: body.risk || null,
        nextStep: body.nextStep || null,
        assignedTo: body.assignedTo || null,
        notes: body.notes || null,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    // Link customers
    if (body.customerIds && Array.isArray(body.customerIds)) {
      await db.dealCustomer.createMany({
        data: body.customerIds.map((customerId: string) => ({
          dealId: deal.id,
          customerId,
        })),
      });
    }

    // Link properties
    if (body.propertyIds && Array.isArray(body.propertyIds)) {
      await db.dealProperty.createMany({
        data: body.propertyIds.map((propertyId: string) => ({
          dealId: deal.id,
          propertyId,
        })),
      });
    }

    // Fetch with relations
    const fullDeal = await db.deal.findUnique({
      where: { id: deal.id },
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

    return NextResponse.json({ data: fullDeal }, { status: 201 });
  } catch (error) {
    console.error('Create deal error:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
