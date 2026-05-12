import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q) {
      return NextResponse.json({ data: { properties: [], customers: [], owners: [] } });
    }

    const [properties, customers, owners] = await Promise.all([
      db.property.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { code: { contains: q } },
            { address: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, code: true, title: true, price: true },
      }),
      db.customer.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { code: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, code: true, name: true, phone: true },
      }),
      db.owner.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { code: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, code: true, name: true, phone: true },
      }),
    ]);

    return NextResponse.json({
      data: {
        properties,
        customers,
        owners,
      },
    });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
