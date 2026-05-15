import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // ─── Essential fast queries ──────────────────────────────────
    const [
      completedDealsThisMonth,
      newCustomersCount,
      newPropertiesCount,
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
      // Commission totals
      db.deal.aggregate({
        _sum: { expectedCommission: true, actualCommission: true },
      }),
    ]);

    const totalRevenue = completedDealsThisMonth.reduce((sum, d) => sum + (d.actualCommission || 0), 0);
    const totalDealValue = completedDealsThisMonth.reduce((sum, d) => sum + (d.value || 0), 0);

    return NextResponse.json({
      data: {
        revenue: {
          totalCommission: totalRevenue,
          totalDealValue,
          expectedCommission: totalCommission._sum.expectedCommission || 0,
          actualCommission: totalCommission._sum.actualCommission || 0,
        },
        customers: {
          newThisMonth: newCustomersCount,
        },
        properties: {
          newThisMonth: newPropertiesCount,
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
