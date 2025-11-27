import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth('COACH');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, isPublic, coachId } = body;

    if (!name || !coachId) {
      return NextResponse.json({ error: 'Name and coachId are required' }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name,
        description: description || '',
        isPublic: isPublic || false,
        members: {
          create: {
            userId: coachId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}

