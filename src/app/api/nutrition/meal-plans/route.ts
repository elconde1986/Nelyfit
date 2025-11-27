import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - List meal plans
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const clientId = searchParams.get('clientId'); // For coaches viewing client plans
    const assignedTo = searchParams.get('assignedTo'); // Filter by assigned client

    let where: any = {};

    if (user.role === 'COACH') {
      // Coaches can see their own plans and plans assigned to their clients
      if (clientId) {
        // Verify coach owns this client
        const client = await prisma.client.findUnique({
          where: { id: clientId },
          select: { coachId: true },
        });

        if (!client || client.coachId !== user.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        where.OR = [
          { userId: user.id }, // Coach's own plans
          { assignedTo: clientId }, // Plans assigned to this client
        ];
      } else {
        where.userId = user.id; // Coach's own plans
      }
    } else if (user.role === 'CLIENT') {
      // Clients see their own plans and plans assigned to them
      where.OR = [
        { userId: user.id },
        { assignedTo: user.clientId || '' },
      ];
    } else if (user.role === 'ADMIN') {
      // Admin can see all
      if (assignedTo) {
        where.assignedTo = assignedTo;
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where,
      include: {
        meals: {
          orderBy: [{ day: 'asc' }, { mealType: 'asc' }],
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ mealPlans });
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json({ error: 'Failed to fetch meal plans' }, { status: 500 });
  }
}

// POST - Create meal plan
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth('COACH');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      goal,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      days,
      assignedTo,
      startDate,
      endDate,
      meals,
    } = body;

    if (!name || !calories || !protein || !carbs || !fats) {
      return NextResponse.json(
        { error: 'Missing required fields: name, calories, protein, carbs, fats' },
        { status: 400 }
      );
    }

    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: user.id,
        name,
        goal: goal || null,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        fiber: fiber ? parseFloat(fiber) : null,
        days: days ? parseInt(days) : 1,
        createdBy: user.id,
        assignedTo: assignedTo || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        meals: {
          create: (meals || []).map((meal: any) => ({
            name: meal.name,
            mealType: meal.mealType,
            day: meal.day || 1,
            calories: parseInt(meal.calories),
            protein: parseFloat(meal.protein),
            carbs: parseFloat(meal.carbs),
            fats: parseFloat(meal.fats),
            ingredients: meal.ingredients || [],
            notes: meal.notes || null,
          })),
        },
      },
      include: {
        meals: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ mealPlan }, { status: 201 });
  } catch (error) {
    console.error('Error creating meal plan:', error);
    return NextResponse.json({ error: 'Failed to create meal plan' }, { status: 500 });
  }
}

