# 🚀 Quick Production Database Seed

## The Problem
You're getting "Invalid email or password" because the production database hasn't been seeded with test accounts yet.

## Quick Fix (3 Steps)

### Step 1: Get Production DATABASE_URL

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **Nelyfit project**
3. Go to **Settings** → **Environment Variables**
4. Find **`DATABASE_URL`** and **copy the value**

### Step 2: Run Seed Command

Open your terminal and run:

```bash
# Set the production database URL (replace with your actual URL)
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Run the seed
npx prisma db seed
```

**Or use the helper script:**
```bash
export DATABASE_URL="your-production-database-url-here"
./seed-production.sh
```

### Step 3: Verify

After seeding, try logging in again:
- **Email**: `client@nelsyfit.demo`
- **Password**: `demo`

## What Gets Created

✅ **Test Accounts**:
- Admin: `admin@nelsyfit.demo` / `demo`
- Coach: `coach@nelsyfit.demo` / `demo`
- Client: `client@nelsyfit.demo` / `demo`
- Client 2: `client2@nelsyfit.demo` / `demo`
- Client 3: `client3@nelsyfit.demo` / `demo`
- Client 4: `client4@nelsyfit.demo` / `demo`

✅ **Workouts**:
- "Upper Body Focus" with 4 exercises
- Other sample workouts

✅ **Programs, Exercises, and Test Data**

## Security Note

⚠️ **Important**: The seed script uses `upsert`, so it's safe to run multiple times. It will:
- Create accounts if they don't exist
- Update existing accounts (but won't change passwords if they exist)
- Create workouts and other data

## Troubleshooting

**Error: "Can't reach database server"**
- Check your DATABASE_URL is correct
- Verify the database is accessible from your network
- Check Vercel database connection settings

**Error: "Migration needed"**
- Run: `npx prisma migrate deploy`
- Then run: `npx prisma db seed`

**Still can't login after seeding?**
- Check browser console for errors
- Verify the seed completed successfully
- Try clearing browser cookies and logging in again

