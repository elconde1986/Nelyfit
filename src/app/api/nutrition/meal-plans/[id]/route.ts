import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get meal plan details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: params.id },
      include: {
        meals: {
          orderBy: [{ day: 'asc' }, { mealType: 'asc' }],
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    // Verify access
    if (mealPlan.userId !== user.id && mealPlan.assignedTo !== user.clientId && user.role !== 'ADMIN') {
      // Check if coach owns the client
      if (user.role === 'COACH' && mealPlan.assignedTo) {
        const client = await prisma.client.findUnique({
          where: { id: mealPlan.assignedTo },
          select: { coachId: true },
        });

        if (!client || client.coachId !== user.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    return NextResponse.json({ mealPlan });
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    return NextResponse.json({ error: 'Failed to fetch meal plan' }, { status: 500 });
  }
}

// PUT - Update meal plan
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth('COACH');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: params.id },
    });

    if (!mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    // Verify ownership
    if (mealPlan.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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

    // Update meal plan
    const updated = await prisma.mealPlan.update({
      where: { id: params.id },
      data: {
        name: name || mealPlan.name,
        goal: goal !== undefined ? goal : mealPlan.goal,
        calories: calories ? parseInt(calories) : mealPlan.calories,
        protein: protein ? parseFloat(protein) : mealPlan.protein,
        carbs: carbs ? parseFloat(carbs) : mealPlan.carbs,
        fats: fats ? parseFloat(fats) : mealPlan.fats,
        fiber: fiber !== undefined ? (fiber ? parseFloat(fiber) : null) : mealPlan.fiber,
        days: days ? parseInt(days) : mealPlan.days,
        assignedTo: assignedTo !== undefined ? assignedTo : mealPlan.assignedTo,
        startDate: startDate ? new Date(startDate) : mealPlan.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : mealPlan.endDate,
      },
      include: {
        meals: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Update meals if provided
    if (meals && Array.isArray(meals)) {
      // Delete existing meals
      await prisma.meal.deleteMany({
        where: { mealPlanId: params.id },
      });

      // Create new meals
      await prisma.meal.createMany({
        data: meals.map((meal: any) => ({
          mealPlanId: params.id,
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
      });

      // Refetch with updated meals
      const updatedWithMeals = await prisma.mealPlan.findUnique({
        where: { id: params.id },
        include: {
          meals: {
            orderBy: [{ day: 'asc' }, { mealType: 'asc' }],
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json({ mealPlan: updatedWithMeals });
    }

    return NextResponse.json({ mealPlan: updated });
  } catch (error) {
    console.error('Error updating meal plan:', error);
    return NextResponse.json({ error: 'Failed to update meal plan' }, { status: 500 });
  }
}

// DELETE - Delete meal plan
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth('COACH');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: params.id },
    });

    if (!mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    // Verify ownership
    if (mealPlan.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.mealPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json({ error: 'Failed to delete meal plan' }, { status: 500 });
  }
}

