import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const [propertyDocs, dealDocs] = await Promise.all([
      db.propertyDoc.findMany({
        include: {
          property: {
            select: {
              id: true,
              code: true,
              title: true,
              propertyType: true,
              demand: true,
              area: true,
              isHot: true,
            },
          },
        },
      }),
      db.dealDoc.findMany({
        include: {
          deal: {
            select: {
              id: true,
              code: true,
              type: true,
            },
          },
        },
      }),
    ]);

    const mappedPropertyDocs = propertyDocs.map((doc) => {
      const propertyTags: string[] = [];
      if (doc.property) {
        if (doc.property.demand) propertyTags.push(doc.property.demand);
        if (doc.property.propertyType) propertyTags.push(doc.property.propertyType);
        if (doc.property.area) {
          const lowerArea = doc.property.area.toLowerCase();
          if (lowerArea.includes('quận 7') || lowerArea.includes('q7') || lowerArea.includes('q.7')) {
            propertyTags.push('q7');
          } else if (lowerArea.includes('nhà bè')) {
            propertyTags.push('nhabe');
          } else if (lowerArea.includes('bình chánh')) {
            propertyTags.push('binhchanh');
          }
        }
        if (doc.property.isHot) propertyTags.push('hot');
      }

      // Determine category based on doc type
      let category: 'property_legal' | 'owner_legal' | 'transaction' | 'media' = 'property_legal';
      if (doc.type === 'id_card' || doc.type === 'marital_status') {
        category = 'owner_legal';
      } else if (doc.type === 'photo') {
        category = 'media';
      } else if (doc.type === 'brokerage_contract') {
        category = 'transaction';
      }

      // Guess file type from url/extension
      const fileExt = doc.fileUrl.split('.').pop()?.toLowerCase() || '';
      const fileType = fileExt === 'pdf' 
        ? 'pdf' 
        : ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileExt) 
          ? 'image' 
          : ['xls', 'xlsx', 'csv'].includes(fileExt) 
            ? 'spreadsheet' 
            : 'doc';

      return {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        category,
        fileType,
        entityType: 'property' as const,
        entityId: doc.propertyId,
        entityName: doc.property?.title || doc.property?.code || 'Tài sản không xác định',
        uploadDate: doc.createdAt.toISOString(),
        status: doc.status === 'sufficient' ? 'complete' : doc.status === 'insufficient' ? 'incomplete' : 'needs_update',
        size: '2.1 MB',
        propertyTags,
      };
    });

    const mappedDealDocs = dealDocs.map((doc) => {
      const fileExt = doc.fileUrl.split('.').pop()?.toLowerCase() || '';
      const fileType = fileExt === 'pdf' 
        ? 'pdf' 
        : ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileExt) 
          ? 'image' 
          : ['xls', 'xlsx', 'csv'].includes(fileExt) 
            ? 'spreadsheet' 
            : 'doc';

      return {
        id: doc.id,
        name: doc.name,
        type: doc.type,
        category: 'transaction' as const,
        fileType,
        entityType: 'deal' as const,
        entityId: doc.dealId,
        entityName: doc.deal?.code || 'Giao dịch không xác định',
        uploadDate: doc.createdAt.toISOString(),
        status: doc.status === 'sufficient' ? 'complete' : doc.status === 'insufficient' ? 'incomplete' : 'needs_update',
        size: '1.5 MB',
        propertyTags: doc.deal?.type ? [doc.deal.type] : ['sell'],
      };
    });

    return NextResponse.json({
      data: [...mappedPropertyDocs, ...mappedDealDocs],
    });
  } catch (error) {
    console.error('Fetch documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, fileUrl, entityType, entityId, status = 'sufficient' } = body;

    if (!name || !type || !fileUrl || !entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let result;
    if (entityType === 'property') {
      result = await db.propertyDoc.create({
        data: {
          name,
          type,
          fileUrl,
          propertyId: entityId,
          status,
        },
      });
    } else if (entityType === 'deal') {
      result = await db.dealDoc.create({
        data: {
          name,
          type,
          fileUrl,
          dealId: entityId,
          status,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid entityType. Must be property or deal.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('Create document error:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
