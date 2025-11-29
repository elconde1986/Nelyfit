# 🔧 Fix Production Login Issue

## The Problem
You're getting "Invalid email or password" because the seed ran against a different database than what Vercel production is using.

## Solution

### Step 1: Get Production DATABASE_URL from Vercel

1. Go to: https://vercel.com/dashboard
2. Select your **Nelyfit project**
3. Go to **Settings** → **Environment Variables**
4. Find **`DATABASE_URL`** in the **Production** environment
5. **Copy the full value**

### Step 2: Run Seed with Production DATABASE_URL

```bash
# Set the production DATABASE_URL (replace with actual value from Vercel)
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Verify it's set
echo $DATABASE_URL

# Run seed
npx prisma db seed
```

### Step 3: Verify Users Were Created

```bash
# Run verification script
npx ts-node verify-production-users.ts
```

You should see:
- ✅ client@nelsyfit.demo: Has Password: YES
- ✅ Upper Body Focus workout: Total Exercises: 4

### Step 4: Test Login

After seeding, try logging in:
- **Email**: `client@nelsyfit.demo`
- **Password**: `demo`

## Important Notes

⚠️ **The DATABASE_URL in your current environment might be different from Vercel's production DATABASE_URL**

Vercel stores environment variables separately for each environment (Production, Preview, Development). Make sure you're using the **Production** environment's DATABASE_URL.

## Quick Check

To verify which database your production app is using:
1. Check Vercel deployment logs
2. Or add a temporary API route to echo the DATABASE_URL (then delete it immediately for security)

