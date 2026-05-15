import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const dueDateFrom = searchParams.get('dueDateFrom');
    const dueDateTo = searchParams.get('dueDateTo');
    const overdue = searchParams.get('overdue');
    const today = searchParams.get('today');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      const statuses = status.split(',');
      where.status = statuses.length === 1 ? status : { in: statuses };
    }
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    if (dueDateFrom || dueDateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dueDateFrom) dateFilter.gte = new Date(dueDateFrom);
      if (dueDateTo) dateFilter.lte = new Date(dueDateTo);
      where.dueDate = dateFilter;
    }

    if (overdue === 'true') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.dueDate = { lt: startOfDay };
      where.status = { not: 'completed' };
    }

    if (today === 'true') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      where.dueDate = { gte: startOfDay, lte: endOfDay };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        select: {
          id: true,
          title: true,
          type: true,
          priority: true,
          status: true,
          dueDate: true,
          dueTime: true,
          description: true,
          isRecurring: true,
          assignedTo: true,
          createdAt: true,
          user: { select: { id: true, name: true, role: true } },
          taskCustomers: {
            select: {
              customer: { select: { id: true, name: true, code: true } },
            },
          },
          taskOwners: {
            select: {
              owner: { select: { id: true, name: true, code: true } },
            },
          },
          taskDeals: {
            select: {
              deal: { select: { id: true, code: true, stage: true } },
            },
          },
        },
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'desc' },
        ],
        skip,
        take: limit,
      }),
      db.task.count({ where }),
    ]);

    return NextResponse.json({
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Tasks list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const task = await db.task.create({
      data: {
        title: body.title,
        type: body.type || 'call',
        priority: body.priority || 'medium',
        status: body.status || 'pending',
        dueDate: new Date(body.dueDate),
        dueTime: body.dueTime || null,
        description: body.description || null,
        isRecurring: body.isRecurring || false,
        recurPattern: body.recurPattern || null,
        assignedTo: body.assignedTo,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    // Link customers
    if (body.customerIds && Array.isArray(body.customerIds)) {
      await db.taskCustomer.createMany({
        data: body.customerIds.map((customerId: string) => ({
          taskId: task.id,
          customerId,
        })),
      });
    }

    // Link owners
    if (body.ownerIds && Array.isArray(body.ownerIds)) {
      await db.taskOwner.createMany({
        data: body.ownerIds.map((ownerId: string) => ({
          taskId: task.id,
          ownerId,
        })),
      });
    }

    // Link deals
    if (body.dealIds && Array.isArray(body.dealIds)) {
      await db.taskDeal.createMany({
        data: body.dealIds.map((dealId: string) => ({
          taskId: task.id,
          dealId,
        })),
      });
    }

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
