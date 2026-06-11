import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // ─── Extended heavy queries ──────────────────────────────────
    const [
      dealsByStage,
      hotPropertiesCount,
      activePropertiesCount,
      customersBySource,
      customersByHeat,
      totalDeals,
      activeDeals,
      recentInteractions,
      recentDeals,
      allCompletedDeals6Months,
    ] = await Promise.all([
      // Deals count by stage
      db.deal.groupBy({
        by: ['stage'],
        _count: { id: true },
      }),
      // Hot properties
      db.property.count({
        where: { isHot: true, status: 'active' },
      }),
      // Active properties
      db.property.count({
        where: { status: 'active' },
      }),
      // Customer source breakdown
      db.customer.groupBy({
        by: ['source'],
        _count: { id: true },
      }),
      // Customer heat level breakdown
      db.customer.groupBy({
        by: ['heatLevel'],
        _count: { id: true },
      }),
      // Total deals
      db.deal.count(),
      // Active deals
      db.deal.count({
        where: { stage: { notIn: ['completed', 'lost'] } },
      }),
      // Recent interactions
      db.interaction.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        select: {
          id: true, type: true, content: true, date: true,
          customer: { select: { id: true, name: true, code: true } },
        },
      }),
      // Recent deals
      db.deal.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true, code: true, stage: true, value: true, updatedAt: true,
        },
      }),
      // ALL completed deals in last 6 months
      db.deal.findMany({
        where: {
          stage: 'completed',
          updatedAt: { gte: sixMonthsAgo },
        },
        select: { actualCommission: true, value: true, updatedAt: true },
      }),
    ]);

    // Process results
    const dealStageMap: Record<string, number> = {};
    dealsByStage.forEach((item) => {
      dealStageMap[item.stage] = item._count.id;
    });

    const sourceBreakdown = customersBySource
      .filter((item) => item.source !== null)
      .map((item) => ({ source: item.source, count: item._count.id }))
      .sort((a, b) => b.count - a.count);

    const heatBreakdown = customersByHeat.map((item) => ({
      level: item.heatLevel,
      count: item._count.id,
    }));

    const monthlyRevenueMap = new Map<string, { revenue: number; dealValue: number; dealCount: number }>();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenueMap.set(monthKey, { revenue: 0, dealValue: 0, dealCount: 0 });
    }
    
    allCompletedDeals6Months.forEach((deal) => {
      const d = new Date(deal.updatedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyRevenueMap.get(key);
      if (entry) {
        entry.revenue += deal.actualCommission || 0;
        entry.dealValue += deal.value || 0;
        entry.dealCount += 1;
      }
    });

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));

    return NextResponse.json({
      data: {
        deals: {
          total: totalDeals,
          active: activeDeals,
          completed: dealStageMap['completed'] || 0,
          lost: dealStageMap['lost'] || 0,
          byStage: dealStageMap,
        },
        customers: {
          bySource: sourceBreakdown,
          byHeat: heatBreakdown,
        },
        properties: {
          active: activePropertiesCount,
          hot: hotPropertiesCount,
        },
        monthlyRevenue,
        recentActivity: {
          interactions: recentInteractions,
          deals: recentDeals,
        },
      },
    });
  } catch (error) {
    console.error('Extended Dashboard API error, falling back to empty datasets:', error);
    return NextResponse.json({
      data: {
        deals: {
          total: 0,
          active: 0,
          completed: 0,
          lost: 0,
          byStage: {},
        },
        customers: {
          bySource: [],
          byHeat: [],
        },
        properties: {
          active: 0,
          hot: 0,
        },
        monthlyRevenue: [],
        recentActivity: {
          interactions: [],
          deals: [],
        },
      }
    });
  }
}
