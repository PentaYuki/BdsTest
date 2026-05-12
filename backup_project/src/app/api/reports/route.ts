import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'overview'; // overview, revenue, area, source, effectiveness
    const periodFrom = searchParams.get('periodFrom');
    const periodTo = searchParams.get('periodTo');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const dateFrom = periodFrom ? new Date(periodFrom) : startOfMonth;
    const dateTo = periodTo ? new Date(periodTo) : endOfMonth;

    if (reportType === 'revenue') {
      // Revenue by month (last 12 months)
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

        const deals = await db.deal.findMany({
          where: {
            stage: 'completed',
            updatedAt: { gte: monthStart, lte: monthEnd },
          },
        });

        const rentDeals = deals.filter((d) => d.type === 'rent');
        const sellDeals = deals.filter((d) => d.type === 'sell');

        monthlyData.push({
          month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
          totalRevenue: deals.reduce((sum, d) => sum + (d.actualCommission || 0), 0),
          totalDealValue: deals.reduce((sum, d) => sum + (d.value || 0), 0),
          dealCount: deals.length,
          rentRevenue: rentDeals.reduce((sum, d) => sum + (d.actualCommission || 0), 0),
          rentCount: rentDeals.length,
          sellRevenue: sellDeals.reduce((sum, d) => sum + (d.actualCommission || 0), 0),
          sellCount: sellDeals.length,
        });
      }

      return NextResponse.json({ data: monthlyData });
    }

    if (reportType === 'area') {
      // Revenue and deals by area
      const properties = await db.property.findMany({
        where: { area: { not: null } },
        include: {
          dealProperties: {
            include: {
              deal: true,
            },
          },
        },
      });

      const areaMap: Record<string, { propertyCount: number; dealCount: number; totalValue: number; totalCommission: number }> = {};

      properties.forEach((prop) => {
        const areaKey = prop.area || 'Không xác định';
        if (!areaMap[areaKey]) {
          areaMap[areaKey] = { propertyCount: 0, dealCount: 0, totalValue: 0, totalCommission: 0 };
        }
        areaMap[areaKey].propertyCount++;
        prop.dealProperties.forEach((dp) => {
          if (dp.deal.stage === 'completed') {
            areaMap[areaKey].dealCount++;
            areaMap[areaKey].totalValue += dp.deal.value || 0;
            areaMap[areaKey].totalCommission += dp.deal.actualCommission || 0;
          }
        });
      });

      const areaData = Object.entries(areaMap).map(([area, data]) => ({
        area,
        ...data,
      }));

      return NextResponse.json({ data: areaData });
    }

    if (reportType === 'source') {
      // Customer source effectiveness
      const customers = await db.customer.findMany({
        where: { source: { not: null } },
        include: {
          dealCustomers: {
            include: {
              deal: true,
            },
          },
        },
      });

      const sourceMap: Record<string, { customerCount: number; completedDeals: number; totalCommission: number; totalDealValue: number }> = {};

      customers.forEach((cust) => {
        const sourceKey = cust.source || 'unknown';
        if (!sourceMap[sourceKey]) {
          sourceMap[sourceKey] = { customerCount: 0, completedDeals: 0, totalCommission: 0, totalDealValue: 0 };
        }
        sourceMap[sourceKey].customerCount++;
        cust.dealCustomers.forEach((dc) => {
          if (dc.deal.stage === 'completed') {
            sourceMap[sourceKey].completedDeals++;
            sourceMap[sourceKey].totalCommission += dc.deal.actualCommission || 0;
            sourceMap[sourceKey].totalDealValue += dc.deal.value || 0;
          }
        });
      });

      const sourceData = Object.entries(sourceMap)
        .map(([source, data]) => ({
          source,
          ...data,
          conversionRate: data.customerCount > 0 ? (data.completedDeals / data.customerCount) * 100 : 0,
        }))
        .sort((a, b) => b.customerCount - a.customerCount);

      return NextResponse.json({ data: sourceData });
    }

    if (reportType === 'effectiveness') {
      // Marketing campaign effectiveness
      const campaigns = await db.campaign.findMany({
        where: {
          postDate: { gte: dateFrom, lte: dateTo },
        },
      });

      const byChannel: Record<string, { campaignCount: number; totalCost: number; totalLeads: number; totalViewings: number; totalDeals: number; totalRevenue: number }> = {};

      campaigns.forEach((camp) => {
        if (!byChannel[camp.channel]) {
          byChannel[camp.channel] = { campaignCount: 0, totalCost: 0, totalLeads: 0, totalViewings: 0, totalDeals: 0, totalRevenue: 0 };
        }
        byChannel[camp.channel].campaignCount++;
        byChannel[camp.channel].totalCost += camp.cost;
        byChannel[camp.channel].totalLeads += camp.leadsGenerated;
        byChannel[camp.channel].totalViewings += camp.viewingsGenerated;
        byChannel[camp.channel].totalDeals += camp.dealsGenerated;
        byChannel[camp.channel].totalRevenue += camp.revenue;
      });

      const effectivenessData = Object.entries(byChannel)
        .map(([channel, data]) => ({
          channel,
          ...data,
          costPerLead: data.totalLeads > 0 ? data.totalCost / data.totalLeads : 0,
          costPerDeal: data.totalDeals > 0 ? data.totalCost / data.totalDeals : 0,
          roi: data.totalCost > 0 ? ((data.totalRevenue - data.totalCost) / data.totalCost) * 100 : 0,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);

      return NextResponse.json({ data: effectivenessData });
    }

    // Default: overview
    const totalCustomers = await db.customer.count();
    const totalProperties = await db.property.count();
    const totalDeals = await db.deal.count();
    const totalOwners = await db.owner.count();

    const completedDeals = await db.deal.findMany({
      where: { stage: 'completed' },
    });

    const totalRevenue = completedDeals.reduce((sum, d) => sum + (d.actualCommission || 0), 0);
    const totalDealValue = completedDeals.reduce((sum, d) => sum + (d.value || 0), 0);

    // Pipeline distribution
    const pipelineDist = await db.deal.groupBy({
      by: ['stage'],
      _count: { id: true },
      _sum: { value: true, expectedCommission: true },
    });

    // Property type distribution
    const propertyTypeDist = await db.property.groupBy({
      by: ['propertyType'],
      _count: { id: true },
    });

    // Customer type distribution
    const customerTypeDist = await db.customer.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    return NextResponse.json({
      data: {
        summary: {
          totalCustomers,
          totalProperties,
          totalDeals,
          totalOwners,
          totalRevenue,
          totalDealValue,
          avgCommission: completedDeals.length > 0 ? totalRevenue / completedDeals.length : 0,
        },
        pipeline: pipelineDist.map((p) => ({
          stage: p.stage,
          count: p._count.id,
          totalValue: p._sum.value || 0,
          expectedCommission: p._sum.expectedCommission || 0,
        })),
        propertyTypes: propertyTypeDist.map((p) => ({
          type: p.propertyType,
          count: p._count.id,
        })),
        customerTypes: customerTypeDist.map((c) => ({
          type: c.type,
          count: c._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
}
