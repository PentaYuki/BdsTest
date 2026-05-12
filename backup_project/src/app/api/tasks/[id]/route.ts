import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await db.task.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, role: true } },
        taskCustomers: {
          include: {
            customer: { select: { id: true, name: true, code: true, phone: true } },
          },
        },
        taskOwners: {
          include: {
            owner: { select: { id: true, name: true, code: true, phone: true } },
          },
        },
        taskDeals: {
          include: {
            deal: { select: { id: true, code: true, stage: true, value: true } },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error('Task detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
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

    const task = await db.task.update({
      where: { id },
      data: {
        title: body.title,
        type: body.type,
        priority: body.priority,
        status: body.status,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        dueTime: body.dueTime !== undefined ? body.dueTime : undefined,
        description: body.description !== undefined ? body.description : undefined,
        isRecurring: body.isRecurring,
        recurPattern: body.recurPattern !== undefined ? body.recurPattern : undefined,
        assignedTo: body.assignedTo,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
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
    await db.task.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
