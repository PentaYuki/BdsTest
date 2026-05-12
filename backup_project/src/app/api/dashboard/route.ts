import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // e.g., "2025-07"

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Revenue from completed deals this month
    const completedDeals = await db.deal.findMany({
      where: {
        stage: 'completed',
        updatedAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const totalRevenue = completedDeals.reduce((sum, d) => sum + (d.actualCommission || 0), 0);
    const totalDealValue = completedDeals.reduce((sum, d) => sum + (d.value || 0), 0);

    // Deals count by stage
    const dealsByStage = await db.deal.groupBy({
      by: ['stage'],
      _count: { id: true },
    });

    const dealStageMap: Record<string, number> = {};
    dealsByStage.forEach((item) => {
      dealStageMap[item.stage] = item._count.id;
    });

    // New customers this month
    const newCustomersCount = await db.customer.count({
      where: {
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // New properties this month
    const newPropertiesCount = await db.property.count({
      where: {
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // Tasks today
    const tasksToday = await db.task.count({
      where: {
        dueDate: { gte: startOfDay, lte: endOfDay },
        status: { not: 'completed' },
      },
    });

    // Overdue tasks
    const overdueTasks = await db.task.count({
      where: {
        dueDate: { lt: startOfDay },
        status: { not: 'completed' },
      },
    });

    // Follow-ups needed (customers with nextFollowUp in the past or today)
    const followUpsNeeded = await db.customer.count({
      where: {
        nextFollowUp: { lte: endOfDay },
        status: { notIn: ['closed', 'lost'] },
      },
    });

    // Hot properties
    const hotPropertiesCount = await db.property.count({
      where: { isHot: true, status: 'active' },
    });

    // Active properties
    const activePropertiesCount = await db.property.count({
      where: { status: 'active' },
    });

    // Customer source breakdown
    const customersBySource = await db.customer.groupBy({
      by: ['source'],
      _count: { id: true },
    });

    const sourceBreakdown = customersBySource
      .filter((item) => item.source !== null)
      .map((item) => ({
        source: item.source,
        count: item._count.id,
      }))
      .sort((a, b) => b.count - a.count);

    // Customer heat level breakdown
    const customersByHeat = await db.customer.groupBy({
      by: ['heatLevel'],
      _count: { id: true },
    });

    const heatBreakdown = customersByHeat.map((item) => ({
      level: item.heatLevel,
      count: item._count.id,
    }));

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthDeals = await db.deal.findMany({
        where: {
          stage: 'completed',
          updatedAt: { gte: monthStart, lte: monthEnd },
        },
      });
      const monthRevenue = monthDeals.reduce((sum, d) => sum + (d.actualCommission || 0), 0);
      const monthDealValue = monthDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      monthlyRevenue.push({
        month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
        revenue: monthRevenue,
        dealValue: monthDealValue,
        dealCount: monthDeals.length,
      });
    }

    // Pipeline summary
    const totalDeals = await db.deal.count();
    const activeDeals = await db.deal.count({
      where: { stage: { notIn: ['completed', 'lost'] } },
    });
    const totalCommission = await db.deal.aggregate({
      _sum: { expectedCommission: true, actualCommission: true },
    });

    // Recent activities
    const recentInteractions = await db.interaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        customer: { select: { id: true, name: true, code: true } },
      },
    });

    const recentDeals = await db.deal.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

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
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
