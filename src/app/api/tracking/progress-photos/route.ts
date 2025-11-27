import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - List progress photos
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const clientId = searchParams.get('clientId'); // For coaches viewing client photos
    const pose = searchParams.get('pose');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sharedOnly = searchParams.get('sharedOnly') === 'true';

    let where: any = {};

    // Coach viewing client photos
    if (user.role === 'COACH' && clientId) {
      // Verify coach owns this client
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { coachId: true },
      });

      if (!client || client.coachId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      where.userId = clientId;
      // Note: sharedWithCoach field needs to be added to schema
      // For now, coaches can see all client photos (will be restricted once schema updated)
    } else if (user.role === 'CLIENT') {
      // Client viewing own photos
      where.userId = user.id;
    } else if (user.role === 'ADMIN') {
      // Admin can see all
      if (clientId) {
        where.userId = clientId;
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Filters
    if (pose) {
      where.photoType = pose;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const photos = await prisma.progressPhoto.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching progress photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

// POST - Upload progress photo
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth('CLIENT');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const photoType = formData.get('photoType') as string;
    const date = formData.get('date') as string;
    const weight = formData.get('weight') as string;
    const notes = formData.get('notes') as string;
    const sharedWithCoach = formData.get('sharedWithCoach') === 'true';
    const photoUrl = formData.get('photoUrl') as string; // For now, we'll accept URL (future: handle file upload)

    if (!photoUrl || !photoType || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: photoUrl, photoType, date' },
        { status: 400 }
      );
    }

    const photo = await prisma.progressPhoto.create({
      data: {
        userId: user.id,
        photoUrl,
        photoType: photoType, // front, side, back
        date: new Date(date),
        notes: notes || null,
        // Note: weight is stored separately in WeightLog, but we can add it to notes if needed
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error('Error creating progress photo:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

