import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const demand = searchParams.get('demand');
    const heatLevel = searchParams.get('heatLevel');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const areaInterest = searchParams.get('areaInterest');
    const assignedTo = searchParams.get('assignedTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { code: { contains: search } },
      ];
    }
    if (type) where.type = type;
    if (demand) where.demand = demand;
    if (heatLevel) where.heatLevel = heatLevel;
    if (status) where.status = status;
    if (source) where.source = source;
    if (areaInterest) where.areaInterest = areaInterest;
    if (assignedTo) where.assignedTo = assignedTo;

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ]);

    return NextResponse.json({
      data: customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Customers list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Auto-generate code
    const lastCustomer = await db.customer.findFirst({
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    let nextNum = 1;
    if (lastCustomer?.code) {
      const num = parseInt(lastCustomer.code.replace('KH-', ''));
      if (!isNaN(num)) nextNum = num + 1;
    }
    const code = `KH-${String(nextNum).padStart(3, '0')}`;

    const customer = await db.customer.create({
      data: {
        code,
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        zalo: body.zalo || null,
        whatsapp: body.whatsapp || null,
        nationality: body.nationality || 'Việt Nam',
        language: body.language || 'Tiếng Việt',
        type: body.type || 'buy',
        demand: body.demand || 'buy',
        propertyType: body.propertyType || null,
        areaInterest: body.areaInterest || null,
        budget: body.budget || null,
        timeframe: body.timeframe || null,
        heatLevel: body.heatLevel || 'warm',
        source: body.source || null,
        assignedTo: body.assignedTo || null,
        notes: body.notes || null,
        nextFollowUp: body.nextFollowUp ? new Date(body.nextFollowUp) : null,
        status: body.status || 'new',
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
