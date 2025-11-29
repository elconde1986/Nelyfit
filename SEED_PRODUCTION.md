# Seeding Production Database

## Option 1: Using Vercel CLI (Recommended)

If you have Vercel CLI installed and are logged in:

```bash
# Make sure you're logged in
vercel login

# Run seed command in production environment
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)
npx prisma db seed --schema=./prisma/schema.prisma
```

Or use Vercel's exec command (if available):
```bash
vercel exec -- npm run prisma:seed
```

## Option 2: Local Connection to Production DB

1. Get your production DATABASE_URL from Vercel:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Copy the `DATABASE_URL` value

2. Run seed locally with production DATABASE_URL:
```bash
# Set production database URL temporarily
export DATABASE_URL="your-production-database-url-here"

# Run seed
npx prisma db seed

# Or use the npm script
npm run prisma:seed
```

## Option 3: Create a One-Time API Route (Not Recommended for Security)

⚠️ **Warning**: This exposes your seed endpoint. Delete it immediately after use.

Create `src/app/api/admin/seed/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  // Add authentication check here
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { stdout, stderr } = await execAsync('npx prisma db seed');
    return NextResponse.json({ 
      success: true, 
      output: stdout,
      error: stderr 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

Then call it:
```bash
curl -X POST https://your-domain.com/api/admin/seed \
  -H "Authorization: Bearer YOUR_SEED_SECRET"
```

**Remember to delete this route after seeding!**

## Recommended Approach

**Option 2** is the safest and most straightforward:

1. Get production DATABASE_URL from Vercel dashboard
2. Run seed locally with that URL
3. Verify the data was seeded correctly

```bash
# One-liner (replace with your actual DATABASE_URL)
DATABASE_URL="postgresql://user:password@host:5432/database" npx prisma db seed
```

