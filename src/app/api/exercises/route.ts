import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth('COACH');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const modality = searchParams.get('modality');
    const bodyRegion = searchParams.get('bodyRegion');
    const movementPattern = searchParams.get('movementPattern');
    const muscles = searchParams.getAll('muscles');
    const equipment = searchParams.getAll('equipment');
    const difficulty = searchParams.get('difficulty');
    const environment = searchParams.get('environment');
    const coachOnly = searchParams.get('coachOnly') === 'true';
    const globalOnly = searchParams.get('globalOnly') === 'true';
    const favorites = searchParams.get('favorites') === 'true';
    const sortBy = searchParams.get('sortBy') || 'recommended';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};

    // Search across name, muscles, equipment, category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { equipment: { contains: search, mode: 'insensitive' } },
        { musclesTargeted: { hasSome: [search] } },
      ];
    }

    // Filters
    if (modality) {
      where.category = { contains: modality, mode: 'insensitive' };
    }

    if (equipment.length > 0) {
      where.OR = [
        ...(where.OR || []),
        ...equipment.map(eq => ({ equipment: { contains: eq, mode: 'insensitive' } })),
      ];
    }

    if (muscles.length > 0) {
      where.musclesTargeted = { hasSome: muscles };
    }

    // Coach-specific filters - filter by isLibraryExercise
    if (coachOnly) {
      where.isLibraryExercise = false;
      where.workoutId = null; // Coach-created exercises
    }

    if (globalOnly) {
      where.isLibraryExercise = true;
    }

    // Sort options
    let orderBy: any = {};
    switch (sortBy) {
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
      case 'mostUsed':
        orderBy = { _count: { workoutExercises: 'desc' } };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'difficultyAsc':
        // No difficulty field, sort by name
        orderBy = { name: 'asc' };
        break;
      case 'difficultyDesc':
        orderBy = { name: 'desc' };
        break;
      case 'durationAsc':
        orderBy = { durationSeconds: 'asc' };
        break;
      case 'durationDesc':
        orderBy = { durationSeconds: 'desc' };
        break;
      default: // recommended
        orderBy = { _count: { workoutExercises: 'desc' } };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      include: {
        _count: {
          select: { workoutExercises: true },
        },
        coachVideos: {
          where: { coachId: user.id, status: 'ACTIVE' },
          take: 1,
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.exercise.count({ where });

    return NextResponse.json({
      exercises,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}

