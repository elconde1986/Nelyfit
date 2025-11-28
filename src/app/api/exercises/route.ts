import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const libraryOnly = searchParams.get('library') === 'true';
    const search = searchParams.get('search');
    const modality = searchParams.get('modality');
    const bodyRegion = searchParams.get('bodyRegion');
    const equipment = searchParams.get('equipment');
    const difficulty = searchParams.get('difficulty');

    const where: any = {};

    if (libraryOnly) {
      where.isLibraryExercise = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { primaryMuscles: { hasSome: [search] } },
        { equipmentCategory: { contains: search, mode: 'insensitive' } },
        { equipmentDetail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (modality) {
      where.modality = modality;
    }

    if (bodyRegion) {
      where.bodyRegion = bodyRegion;
    }

    if (equipment) {
      where.OR = [
        { equipmentCategory: equipment },
        { equipmentDetail: equipment },
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: [
        { difficulty: 'asc' }, // Beginner first
        { name: 'asc' },
      ],
      take: 500, // Limit results
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}
