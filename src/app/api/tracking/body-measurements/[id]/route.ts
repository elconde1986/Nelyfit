import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT - Update body measurement
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const measurement = await prisma.bodyMeasurement.findUnique({
      where: { id: params.id },
    });

    if (!measurement) {
      return NextResponse.json({ error: 'Measurement not found' }, { status: 404 });
    }

    // Verify ownership
    if (measurement.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
    } = body;

    const updated = await prisma.bodyMeasurement.update({
      where: { id: params.id },
      data: {
        date: date ? new Date(date) : measurement.date,
        weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : measurement.weight,
        bodyFat: bodyFat !== undefined ? (bodyFat ? parseFloat(bodyFat) : null) : measurement.bodyFat,
        muscleMass: muscleMass !== undefined ? (muscleMass ? parseFloat(muscleMass) : null) : measurement.muscleMass,
        neck: neck !== undefined ? (neck ? parseFloat(neck) : null) : measurement.neck,
        shoulders: shoulders !== undefined ? (shoulders ? parseFloat(shoulders) : null) : measurement.shoulders,
        chest: chest !== undefined ? (chest ? parseFloat(chest) : null) : measurement.chest,
        waist: waist !== undefined ? (waist ? parseFloat(waist) : null) : measurement.waist,
        hips: hips !== undefined ? (hips ? parseFloat(hips) : null) : measurement.hips,
        bicepL: bicepL !== undefined ? (bicepL ? parseFloat(bicepL) : null) : measurement.bicepL,
        bicepR: bicepR !== undefined ? (bicepR ? parseFloat(bicepR) : null) : measurement.bicepR,
        forearmL: forearmL !== undefined ? (forearmL ? parseFloat(forearmL) : null) : measurement.forearmL,
        forearmR: forearmR !== undefined ? (forearmR ? parseFloat(forearmR) : null) : measurement.forearmR,
        thighL: thighL !== undefined ? (thighL ? parseFloat(thighL) : null) : measurement.thighL,
        thighR: thighR !== undefined ? (thighR ? parseFloat(thighR) : null) : measurement.thighR,
        calfL: calfL !== undefined ? (calfL ? parseFloat(calfL) : null) : measurement.calfL,
        calfR: calfR !== undefined ? (calfR ? parseFloat(calfR) : null) : measurement.calfR,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ measurement: updated });
  } catch (error) {
    console.error('Error updating body measurement:', error);
    return NextResponse.json({ error: 'Failed to update measurement' }, { status: 500 });
  }
}

// DELETE - Delete body measurement
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const measurement = await prisma.bodyMeasurement.findUnique({
      where: { id: params.id },
    });

    if (!measurement) {
      return NextResponse.json({ error: 'Measurement not found' }, { status: 404 });
    }

    // Verify ownership
    if (measurement.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.bodyMeasurement.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting body measurement:', error);
    return NextResponse.json({ error: 'Failed to delete measurement' }, { status: 500 });
  }
}

