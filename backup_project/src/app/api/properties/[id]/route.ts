import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await db.property.findUnique({
      where: { id },
      include: {
        owner: true,
        user: { select: { id: true, name: true, role: true } },
        priceHistory: { orderBy: { date: 'desc' } },
        propertyViews: {
          include: {
            customer: { select: { id: true, name: true, code: true, phone: true } },
          },
          orderBy: { date: 'desc' },
        },
        dealProperties: {
          include: {
            deal: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        propertyDocs: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ data: property });
  } catch (error) {
    console.error('Property detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
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

    // Check if price changed - add to price history
    if (body.price !== undefined) {
      const current = await db.property.findUnique({
        where: { id },
        select: { price: true },
      });
      if (current && current.price !== body.price) {
        await db.priceHistory.create({
          data: {
            propertyId: id,
            price: body.price,
            note: 'Cập nhật giá mới',
          },
        });
      }
    }

    const property = await db.property.update({
      where: { id },
      data: {
        title: body.title,
        propertyType: body.propertyType,
        demand: body.demand,
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
        status: body.status,
        attractiveness: body.attractiveness || undefined,
        easyToClose: body.easyToClose || undefined,
        isHot: body.isHot,
        isExclusive: body.isExclusive,
        description: body.description || null,
        assignedTo: body.assignedTo || null,
        lastUpdated: new Date(),
      },
      include: {
        owner: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ data: property });
  } catch (error) {
    console.error('Update property error:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
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
    await db.property.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error('Delete property error:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
