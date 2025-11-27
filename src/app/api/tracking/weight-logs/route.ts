import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.weightLog.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Get weight logs error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, weight, unit, note } = await request.json();

    if (!date || !weight) {
      return NextResponse.json(
        { error: 'Date and weight are required' },
        { status: 400 }
      );
    }

    // Check if log already exists for this date
    const existing = await prisma.weightLog.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: new Date(date),
        },
      },
    });

    if (existing) {
      // Update existing log
      const log = await prisma.weightLog.update({
        where: { id: existing.id },
        data: {
          weight: parseFloat(weight),
          unit: unit || 'kg',
          note: note || null,
        },
      });
      return NextResponse.json({ log });
    } else {
      // Create new log
      const log = await prisma.weightLog.create({
        data: {
          userId: user.id,
          date: new Date(date),
          weight: parseFloat(weight),
          unit: unit || 'kg',
          note: note || null,
        },
      });
      return NextResponse.json({ log });
    }
  } catch (error: any) {
    console.error('Create weight log error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

