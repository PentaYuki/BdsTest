import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const propertyType = searchParams.get('propertyType');
    const demand = searchParams.get('demand');
    const area = searchParams.get('area');
    const status = searchParams.get('status');
    const isHot = searchParams.get('isHot');
    const assignedTo = searchParams.get('assignedTo');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { code: { contains: search } },
        { address: { contains: search } },
        { project: { contains: search } },
      ];
    }
    if (propertyType) where.propertyType = propertyType;
    if (demand) where.demand = demand;
    if (area) where.area = { contains: area };
    if (status) where.status = status;
    if (isHot === 'true') where.isHot = true;
    if (isHot === 'false') where.isHot = false;
    if (assignedTo) where.assignedTo = assignedTo;
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      where.price = priceFilter;
    }

    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        select: {
          id: true,
          code: true,
          title: true,
          propertyType: true,
          demand: true,
          area: true,
          address: true,
          landArea: true,
          useArea: true,
          bedrooms: true,
          bathrooms: true,
          price: true,
          legalStatus: true,
          status: true,
          isHot: true,
          lastUpdated: true,
          createdAt: true,
          images: true,
          owner: { select: { id: true, name: true, code: true, phone: true, cooperationLevel: true } },
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.property.count({ where }),
    ]);

    return NextResponse.json({
      data: properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Properties list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Auto-generate code
    const lastProperty = await db.property.findFirst({
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    let nextNum = 1;
    if (lastProperty?.code) {
      const num = parseInt(lastProperty.code.replace('SP-', ''));
      if (!isNaN(num)) nextNum = num + 1;
    }
    const code = `SP-${String(nextNum).padStart(3, '0')}`;

    const property = await db.property.create({
      data: {
        code,
        title: body.title,
        propertyType: body.propertyType || 'apartment',
        demand: body.demand || 'sell',
        area: body.area || null,
        address: body.address || null,
        project: body.project || null,
        landArea: body.landArea || null,
        useArea: body.useArea || null,
        bedrooms: body.bedrooms || null,
        bathrooms: body.bathrooms || null,
        furniture: body.furniture || null,
        direction: body.direction || null,
        price: body.price,
        expectedPrice: body.expectedPrice || null,
        legalStatus: body.legalStatus || null,
        planningStatus: body.planningStatus || null,
        images: body.images || null,
        videos: body.videos || null,
        ownerId: body.ownerId || null,
        status: body.status || 'new',
        attractiveness: body.attractiveness || 'medium',
        easyToClose: body.easyToClose || 'medium',
        isHot: body.isHot || false,
        isExclusive: body.isExclusive || false,
        description: body.description || null,
        assignedTo: body.assignedTo || null,
      },
      include: {
        owner: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ data: property }, { status: 201 });
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
