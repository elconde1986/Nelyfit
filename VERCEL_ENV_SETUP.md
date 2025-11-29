# 🔧 Vercel Environment Variables Setup

## Required Environment Variable

Vercel needs **`DATABASE_URL`** (not `PRISMA_DATABASE_URL` or `POSTGRES_URL`).

The Prisma schema uses:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Which URL to Use?

You have two options:

### Option 1: Direct Connection (Recommended for seeding)
```
DATABASE_URL="postgres://5df764807b7c224ab831082cf5e82f90e230ab225959f38953dba253e573ab52:sk_z_PtoMgUf7i9JQTlOrAmI@db.prisma.io:5432/postgres?sslmode=require"
```

### Option 2: Prisma Accelerate (Recommended for production)
```
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza196X1B0b01nVWY3aTlKUVRsT3JBbUkiLCJhcGlfa2V5IjoiMDFLQjFCSDhQQzIxRTcxMUg2UDlWVzk2QkgiLCJ0ZW5hbnRfaWQiOiI1ZGY3NjQ4MDdiN2MyMjRhYjgzMTA4MmNmNWU4MmY5MGUyMzBhYjIyNTk1OWYzODk1M2RiYTI1M2U1NzNhYjUyIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjQzMTM1NDYtNDA5MS00NDUzLWEwNDEtYTY4NjNlOTUzY2U4In0.8Xy4sPWMRmNbx322IErXAROr9KVetGShXyYTPlpxWvc"
```

## How to Set in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your **Nelyfit** project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - **Name**: `DATABASE_URL`
   - **Value**: Choose one of the URLs above
   - **Environment**: Select **Production** (and Preview/Development if needed)
5. Click **Save**
6. **Redeploy** your application

## Important Notes

- ✅ Both databases are seeded (direct and Accelerate)
- ✅ Users exist with correct passwords
- ⚠️ Vercel must use `DATABASE_URL` (not `PRISMA_DATABASE_URL`)
- ⚠️ After changing environment variables, **redeploy** is required

## Verification

After setting `DATABASE_URL` in Vercel and redeploying:
1. Try logging in with: `client@nelsyfit.demo` / `demo`
2. Check Vercel function logs for `[LOGIN]` debug messages
3. The logs will show which database is being used

## Recommendation

Use **Prisma Accelerate** (`prisma+postgres://...`) for production as it provides:
- Connection pooling
- Better performance
- Caching
- Monitoring

Both databases are already seeded, so either will work!

