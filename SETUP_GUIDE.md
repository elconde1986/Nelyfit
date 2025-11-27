# NelsyFit Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `STRIPE_PUBLISHABLE_KEY` - From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe webhook settings

### 3. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```

## Stripe Setup

1. Create Stripe account at https://stripe.com
2. Get API keys from Dashboard → Developers → API keys
3. Create products and prices:
   - Premium Monthly: `price_monthly`
   - Premium Annual: `price_annual`
4. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/billing/webhook`
   - Events: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret to `.env`

## OAuth Setup (Optional)

### Google OAuth
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add to `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Apple Sign In
1. Go to Apple Developer Portal
2. Create Service ID and Key
3. Add to `.env`:
   - `APPLE_CLIENT_ID`
   - `APPLE_TEAM_ID`
   - `APPLE_KEY_ID`
   - `APPLE_PRIVATE_KEY`

### Phone OTP (Twilio)
1. Create Twilio account
2. Get credentials from Twilio Console
3. Add to `.env`:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

## Admin Access

To create an admin user:
1. Use Prisma Studio: `npx prisma studio`
2. Find a user and set `role` to `ADMIN`
3. Or update via SQL:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
   ```

## Features Implemented

✅ **Authentication**
- Email/password login
- Signup with access code support
- Multi-provider auth structure (Google, Apple, Phone stubs)

✅ **Temporary Access Codes**
- Code creation in admin panel
- Code validation API
- Code redemption with trial activation

✅ **Trial System**
- 7/14/30 day trials
- Trial tracking and expiration
- Auto-lock on expiration

✅ **Stripe Payments**
- Subscription creation
- Payment webhooks
- Apple Pay / Google Pay ready
- Payment history

✅ **Core Features (Stubs)**
- Training programs page
- Weight tracking page
- Nutrition/meal plans page
- Community groups page
- Admin dashboard

✅ **Database Schema**
- Complete Prisma schema with all models
- Relations properly defined
- Indexes for performance

## Next Steps

1. Run migrations: `npx prisma migrate dev`
2. Implement OAuth providers (Google, Apple, Phone)
3. Build out feature pages (training, tracking, nutrition)
4. Add video upload for exercises
5. Implement cloud storage for progress photos
6. Complete admin panel features

## Deployment

### Vercel
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Database
- Use Vercel Postgres or external PostgreSQL
- Set `DATABASE_URL` in Vercel
- Run: `npx prisma migrate deploy`

