import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function calculateChange(current: number, previous: number) {
  if (previous === 0) {
    return {
      change: current > 0 ? '+100%' : '0%',
      trend: 'up' as 'up' | 'down'
    };
  }
  const pct = ((current - previous) / previous) * 100;
  return {
    change: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
    trend: pct >= 0 ? ('up' as const) : ('down' as const)
  };
}

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    
    // This month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // ─── Essential fast queries ──────────────────────────────────
    const [
      completedDealsThisMonth,
      completedDealsLastMonth,
      newCustomersThisMonth,
      newCustomersLastMonth,
      newPropertiesThisMonth,
      newPropertiesLastMonth,
      tasksToday,
      overdueTasks,
      followUpsNeeded,
      totalCommission,
    ] = await Promise.all([
      // Revenue from completed deals this month
      db.deal.findMany({
        where: {
          stage: 'completed',
          updatedAt: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { actualCommission: true, value: true },
      }),
      // Revenue from completed deals last month
      db.deal.findMany({
        where: {
          stage: 'completed',
          updatedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        select: { actualCommission: true, value: true },
      }),
      // New customers this month
      db.customer.count({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      }),
      // New customers last month
      db.customer.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      // New properties this month
      db.property.count({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      }),
      // New properties last month
      db.property.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
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
      // Commission totals
      db.deal.aggregate({
        _sum: { expectedCommission: true, actualCommission: true },
      }),
    ]);

    const totalRevenueThisMonth = completedDealsThisMonth.reduce((sum, d) => sum + (d.actualCommission || 0), 0);
    const totalRevenueLastMonth = completedDealsLastMonth.reduce((sum, d) => sum + (d.actualCommission || 0), 0);
    
    const totalDealValue = completedDealsThisMonth.reduce((sum, d) => sum + (d.value || 0), 0);

    const revenueStats = calculateChange(totalRevenueThisMonth, totalRevenueLastMonth);
    const dealsStats = calculateChange(completedDealsThisMonth.length, completedDealsLastMonth.length);
    const customersStats = calculateChange(newCustomersThisMonth, newCustomersLastMonth);
    const propertiesStats = calculateChange(newPropertiesThisMonth, newPropertiesLastMonth);

    return NextResponse.json({
      data: {
        revenue: {
          totalCommission: totalRevenueThisMonth,
          totalDealValue,
          expectedCommission: totalCommission._sum.expectedCommission || 0,
          actualCommission: totalCommission._sum.actualCommission || 0,
          change: revenueStats.change,
          trend: revenueStats.trend,
        },
        deals: {
          completed: completedDealsThisMonth.length,
          change: dealsStats.change,
          trend: dealsStats.trend,
        },
        customers: {
          newThisMonth: newCustomersThisMonth,
          change: customersStats.change,
          trend: customersStats.trend,
        },
        properties: {
          newThisMonth: newPropertiesThisMonth,
          change: propertiesStats.change,
          trend: propertiesStats.trend,
        },
        tasks: {
          today: tasksToday,
          overdue: overdueTasks,
        },
        followUpsNeeded,
      },
    });
  } catch (error) {
    console.error('Essential Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
