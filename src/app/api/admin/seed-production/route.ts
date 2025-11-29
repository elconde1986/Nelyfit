import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ⚠️ SECURITY: This endpoint should be deleted immediately after use!
// It requires a secret token to prevent unauthorized access

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check for secret token in header
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.SEED_SECRET || 'CHANGE_THIS_SECRET_BEFORE_USE';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ 
        error: 'Unauthorized. Provide Bearer token in Authorization header.' 
      }, { status: 401 });
    }

    console.log('🌱 Starting production seed via API...');

    // Run seed command
    const { stdout, stderr } = await execAsync('npx prisma db seed', {
      env: process.env,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Seed completed successfully',
      output: stdout,
      error: stderr || null,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stdout: error.stdout || null,
      stderr: error.stderr || null,
    }, { status: 500 });
  }
}

