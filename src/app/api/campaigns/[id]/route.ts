import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await db.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error('Campaign detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
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

    const campaign = await db.campaign.update({
      where: { id },
      data: {
        name: body.name,
        channel: body.channel,
        postDate: body.postDate ? new Date(body.postDate) : null,
        content: body.content !== undefined ? body.content : undefined,
        propertyId: body.propertyId !== undefined ? body.propertyId : undefined,
        cost: body.cost !== undefined ? body.cost : undefined,
        leadsGenerated: body.leadsGenerated !== undefined ? body.leadsGenerated : undefined,
        viewingsGenerated: body.viewingsGenerated !== undefined ? body.viewingsGenerated : undefined,
        dealsGenerated: body.dealsGenerated !== undefined ? body.dealsGenerated : undefined,
        revenue: body.revenue !== undefined ? body.revenue : undefined,
      },
    });

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error('Update campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
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
    await db.campaign.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
