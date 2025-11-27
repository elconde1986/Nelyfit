import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - List body measurements
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const clientId = searchParams.get('clientId'); // For coaches viewing client measurements
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let where: any = {};

    // Coach viewing client measurements
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
    } else if (user.role === 'CLIENT') {
      // Client viewing own measurements
      where.userId = user.id;
    } else if (user.role === 'ADMIN') {
      // Admin can see all
      if (clientId) {
        where.userId = clientId;
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Date filters
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const measurements = await prisma.bodyMeasurement.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ measurements });
  } catch (error) {
    console.error('Error fetching body measurements:', error);
    return NextResponse.json({ error: 'Failed to fetch measurements' }, { status: 500 });
  }
}

// POST - Create body measurement
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth('CLIENT');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      date,
      weight,
      bodyFat,
      muscleMass,
      neck,
      shoulders,
      chest,
      waist,
      hips,
      bicepL,
      bicepR,
      forearmL,
      forearmR,
      thighL,
      thighR,
      calfL,
      calfR,
      thighs, // Legacy support
    } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const measurement = await prisma.bodyMeasurement.create({
      data: {
        userId: user.id,
        date: new Date(date),
        weight: weight ? parseFloat(weight) : null,
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        muscleMass: muscleMass ? parseFloat(muscleMass) : null,
        neck: neck ? parseFloat(neck) : null,
        shoulders: shoulders ? parseFloat(shoulders) : null,
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        hips: hips ? parseFloat(hips) : null,
        bicepL: bicepL ? parseFloat(bicepL) : null,
        bicepR: bicepR ? parseFloat(bicepR) : null,
        forearmL: forearmL ? parseFloat(forearmL) : null,
        forearmR: forearmR ? parseFloat(forearmR) : null,
        thighL: thighL ? parseFloat(thighL) : null,
        thighR: thighR ? parseFloat(thighR) : null,
        calfL: calfL ? parseFloat(calfL) : null,
        calfR: calfR ? parseFloat(calfR) : null,
        thighs: thighs ? parseFloat(thighs) : null, // Legacy
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ measurement }, { status: 201 });
  } catch (error) {
    console.error('Error creating body measurement:', error);
    return NextResponse.json({ error: 'Failed to create measurement' }, { status: 500 });
  }
}

