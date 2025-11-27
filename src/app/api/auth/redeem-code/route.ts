import { NextRequest, NextResponse } from 'next/server';
import { redeemTemporaryCode } from '@/lib/temporary-codes';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const result = await redeemTemporaryCode(code, user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      trialDays: result.trialDays,
    });
  } catch (error) {
    console.error('Redeem code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

