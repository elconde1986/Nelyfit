import { NextRequest, NextResponse } from 'next/server';
import { checkTemporaryCode } from '@/lib/temporary-codes';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const result = await checkTemporaryCode(code);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: {
        type: result.code!.type,
        trialDays: result.code!.trialDays,
        assignedTier: result.code!.assignedTier,
      },
    });
  } catch (error) {
    console.error('Check code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

