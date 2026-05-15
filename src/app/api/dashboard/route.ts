import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Calculate 6 months ago for monthly revenue
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // ─── ALL queries in parallel ───────────────────────────────
    const [
      completedDealsThisMonth,
      dealsByStage,
      newCustomersCount,
      newPropertiesCount,
      tasksToday,
      overdueTasks,
      followUpsNeeded,
      hotPropertiesCount,
      activePropertiesCount,
      customersBySource,
      customersByHeat,
      totalDeals,
      activeDeals,
      totalCommission,
      recentInteractions,
      recentDeals,
      allCompletedDeals6Months,
    ] = await Promise.all([
      // Revenue from completed deals this month
      db.deal.findMany({
        where: {
          stage: 'completed',
          updatedAt: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { actualCommission: true, value: true },
      }),

      // Deals count by stage
      db.deal.groupBy({
        by: ['stage'],
        _count: { id: true },
      }),

      // New customers this month
      db.customer.count({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      }),

      // New properties this month
      db.property.count({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      }),

      // Tasks today
      db.task.count({
        where: {
          dueDate: { gte: startOfDay, lte: endOfDay },
          status: { not: 'completed' },
        },
      }),

      // Overdue tasks
      db.task.count({
        where: {
          dueDate: { lt: startOfDay },
          status: { not: 'completed' },
        },
      }),

      // Follow-ups needed
      db.customer.count({
        where: {
          nextFollowUp: { lte: endOfDay },
          status: { notIn: ['closed', 'lost'] },
        },
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

      // Commission totals
      db.deal.aggregate({
        _sum: { expectedCommission: true, actualCommission: true },
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

      // ALL completed deals in last 6 months (single query instead of 6 loop queries)
      db.deal.findMany({
        where: {
          stage: 'completed',
          updatedAt: { gte: sixMonthsAgo },
        },
        select: { actualCommission: true, value: true, updatedAt: true },
      }),
    ]);

    // ─── Process results ────────────────────────────────────────

    // Revenue
    const totalRevenue = completedDealsThisMonth.reduce((sum, d) => sum + (d.actualCommission || 0), 0);
    const totalDealValue = completedDealsThisMonth.reduce((sum, d) => sum + (d.value || 0), 0);

    // Deal stage map
    const dealStageMap: Record<string, number> = {};
    dealsByStage.forEach((item) => {
      dealStageMap[item.stage] = item._count.id;
    });

    // Source breakdown
    const sourceBreakdown = customersBySource
      .filter((item) => item.source !== null)
      .map((item) => ({ source: item.source, count: item._count.id }))
      .sort((a, b) => b.count - a.count);

    // Heat breakdown
    const heatBreakdown = customersByHeat.map((item) => ({
      level: item.heatLevel,
      count: item._count.id,
    }));

    // Monthly revenue — group the single query result by month (instead of 6 DB queries)
    const monthlyRevenueMap = new Map<string, { revenue: number; dealValue: number; dealCount: number }>();
    for (let i = 5; i >= 0; i--) {
      const monthKey = `${new Date(now.getFullYear(), now.getMonth() - i, 1).getFullYear()}-${String(new Date(now.getFullYear(), now.getMonth() - i, 1).getMonth() + 1).padStart(2, '0')}`;
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

    // ─── Response with cache headers ────────────────────────────

    return NextResponse.json({
      data: {
        revenue: {
          totalCommission: totalRevenue,
          totalDealValue,
          expectedCommission: totalCommission._sum.expectedCommission || 0,
          actualCommission: totalCommission._sum.actualCommission || 0,
        },
        deals: {
          total: totalDeals,
          active: activeDeals,
          completed: dealStageMap['completed'] || 0,
          lost: dealStageMap['lost'] || 0,
          byStage: dealStageMap,
        },
        customers: {
          newThisMonth: newCustomersCount,
          bySource: sourceBreakdown,
          byHeat: heatBreakdown,
        },
        properties: {
          newThisMonth: newPropertiesCount,
          active: activePropertiesCount,
          hot: hotPropertiesCount,
        },
        tasks: {
          today: tasksToday,
          overdue: overdueTasks,
        },
        followUpsNeeded,
        monthlyRevenue,
        recentActivity: {
          interactions: recentInteractions,
          deals: recentDeals,
        },
      },
    }, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
