import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period');

    const now = new Date();
    const currentPeriod = period || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get KPI targets
    const where: Record<string, unknown> = { period: currentPeriod };
    if (userId) where.userId = userId;

    const targets = await db.kPITarget.findMany({
      where,
    });

    // Compute actuals for each user
    const kpiData = await Promise.all(
      targets.map(async (target) => {
        const userWhere: Record<string, unknown> = {
          assignedTo: target.userId,
          updatedAt: { gte: startOfMonth, lte: endOfMonth },
        };

        // Completed deals
        const completedDeals = await db.deal.findMany({
          where: { ...userWhere, stage: 'completed' },
        });

        const actualRevenue = completedDeals.reduce((sum, d) => sum + (d.actualCommission || 0), 0);
        const dealRentCount = completedDeals.filter((d) => d.type === 'rent').length;
        const dealSellCount = completedDeals.filter((d) => d.type === 'sell').length;

        // New customers
        const newCustomerCount = await db.customer.count({
          where: {
            assignedTo: target.userId,
            createdAt: { gte: startOfMonth, lte: endOfMonth },
          },
        });

        // New owners
        const newOwnerCount = await db.owner.count({
          where: {
            createdAt: { gte: startOfMonth, lte: endOfMonth },
          },
        });

        // New properties
        const newPropertyCount = await db.property.count({
          where: {
            assignedTo: target.userId,
            createdAt: { gte: startOfMonth, lte: endOfMonth },
          },
        });

        // Viewings
        const viewingCount = await db.propertyView.count({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
            customer: { assignedTo: target.userId },
          },
        });

        // Closing rate
        const totalDealsThisMonth = await db.deal.count({
          where: {
            assignedTo: target.userId,
            updatedAt: { gte: startOfMonth, lte: endOfMonth },
            stage: { in: ['completed', 'lost'] },
          },
        });
        const closingRate = totalDealsThisMonth > 0 ? completedDeals.length / totalDealsThisMonth : 0;

        // Fetch user separately since KPITarget doesn't have a relation
        const user = await db.user.findUnique({
          where: { id: target.userId },
          select: { id: true, name: true, role: true },
        });

        return {
          user,
          period: target.period,
          target: {
            revenue: target.revenueTarget,
            dealRent: target.dealRentTarget,
            dealSell: target.dealSellTarget,
            newCustomer: target.newCustomerTarget,
            newOwner: target.newOwnerTarget,
            newProperty: target.newPropertyTarget,
            viewing: target.viewingTarget,
            closingRate: target.closingRateTarget,
          },
          actual: {
            revenue: actualRevenue,
            dealRent: dealRentCount,
            dealSell: dealSellCount,
            newCustomer: newCustomerCount,
            newOwner: newOwnerCount,
            newProperty: newPropertyCount,
            viewing: viewingCount,
            closingRate,
          },
          progress: {
            revenue: target.revenueTarget > 0 ? (actualRevenue / target.revenueTarget) * 100 : 0,
            dealRent: target.dealRentTarget > 0 ? (dealRentCount / target.dealRentTarget) * 100 : 0,
            dealSell: target.dealSellTarget > 0 ? (dealSellCount / target.dealSellTarget) * 100 : 0,
            newCustomer: target.newCustomerTarget > 0 ? (newCustomerCount / target.newCustomerTarget) * 100 : 0,
            newOwner: target.newOwnerTarget > 0 ? (newOwnerCount / target.newOwnerTarget) * 100 : 0,
            newProperty: target.newPropertyTarget > 0 ? (newPropertyCount / target.newPropertyTarget) * 100 : 0,
            viewing: target.viewingTarget > 0 ? (viewingCount / target.viewingTarget) * 100 : 0,
            closingRate: target.closingRateTarget > 0 ? (closingRate / target.closingRateTarget) * 100 : 0,
          },
        };
      })
    );

    return NextResponse.json({ data: kpiData });
  } catch (error) {
    console.error('KPI API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI data' },
      { status: 500 }
    );
  }
}
