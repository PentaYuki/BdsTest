import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const cooperationLevel = searchParams.get('cooperationLevel');
    const trustLevel = searchParams.get('trustLevel');
    const area = searchParams.get('area');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { code: { contains: search } },
      ];
    }
    if (cooperationLevel) where.cooperationLevel = cooperationLevel;
    if (trustLevel) where.trustLevel = trustLevel;
    if (area) where.area = { contains: area };

    const [owners, total] = await Promise.all([
      db.owner.findMany({
        where,
        include: {
          _count: { select: { properties: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.owner.count({ where }),
    ]);

    return NextResponse.json({
      data: owners,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Owners list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Auto-generate code
    const lastOwner = await db.owner.findFirst({
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    let nextNum = 1;
    if (lastOwner?.code) {
      const num = parseInt(lastOwner.code.replace('CH-', ''));
      if (!isNaN(num)) nextNum = num + 1;
    }
    const code = `CH-${String(nextNum).padStart(3, '0')}`;

    const owner = await db.owner.create({
      data: {
        code,
        name: body.name,
        phone: body.phone,
        contactChannel: body.contactChannel || null,
        area: body.area || null,
        cooperationLevel: body.cooperationLevel || 'B',
        trustLevel: body.trustLevel || 'medium',
        commissionPolicy: body.commissionPolicy || null,
        notes: body.notes || null,
        lastContact: body.lastContact ? new Date(body.lastContact) : null,
        nextUpdate: body.nextUpdate ? new Date(body.nextUpdate) : null,
      },
    });

    return NextResponse.json({ data: owner }, { status: 201 });
  } catch (error) {
    console.error('Create owner error:', error);
    return NextResponse.json(
      { error: 'Failed to create owner' },
      { status: 500 }
    );
  }
}
