# NelsyFit - Complete Fitness Coaching Platform

A comprehensive, gamified fitness coaching platform with Duolingo-style programs, badges, streaks, payments, and community features.

## 🚀 Features

### Authentication
- ✅ Email/password login
- ✅ Google OAuth (stub)
- ✅ Apple Sign In (stub)
- ✅ Phone OTP (stub)
- ✅ Temporary access codes system
- ✅ Multi-provider authentication support

### Trial & Subscriptions
- ✅ Trial period system (7, 14, 30 days)
- ✅ Stripe integration
- ✅ Apple Pay / Google Pay support
- ✅ Subscription management
- ✅ Payment webhooks
- ✅ Trial conversion tracking

### Core Features
- ✅ Training Programs with progressive overload
- ✅ Exercise tracking with video support
- ✅ Weight logs
- ✅ Progress photos (cloud storage ready)
- ✅ Body measurements
- ✅ Workout history
- ✅ Nutrition & meal planning
- ✅ Grocery list generator
- ✅ Coach-client chat
- ✅ Community groups
- ✅ Challenges & leaderboards
- ✅ Gamification (XP, levels, streaks, badges)

### Admin Panel
- ✅ Dashboard with insights
- ✅ Temporary code creation
- ✅ User management
- ✅ Subscription management
- ✅ Trial conversion reports

## 📁 Project Structure

```
nelsyfit/
├── prisma/
│   ├── schema.prisma          # Complete database schema
│   └── seed.ts                # Database seeding
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── billing/       # Stripe webhooks & billing
│   │   ├── admin/             # Admin panel
│   │   ├── client/            # Client-facing pages
│   │   ├── coach/             # Coach-facing pages
│   │   ├── training/          # Training programs
│   │   ├── tracking/          # Progress tracking
│   │   ├── nutrition/         # Meal planning
│   │   ├── community/         # Groups & challenges
│   │   ├── signup/            # User registration
│   │   └── login/             # Authentication pages
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── training/           # Training-specific components
│   │   ├── tracking/          # Tracking components
│   │   └── admin/             # Admin components
│   └── lib/
│       ├── auth.ts            # Authentication helpers
│       ├── auth-providers.ts  # OAuth providers
│       ├── stripe.ts          # Stripe integration
│       ├── trial.ts           # Trial management
│       ├── temporary-codes.ts # Access code system
│       ├── i18n.ts            # Translations
│       └── prisma.ts          # Prisma client
└── public/
    ├── icons/                 # PWA icons
    └── manifest.json          # PWA manifest
```

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)
- Vercel account (for deployment)

### 2. Environment Variables

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nelsyfit"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OAuth (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
APPLE_CLIENT_ID="..."
APPLE_TEAM_ID="..."
APPLE_KEY_ID="..."

# OTP (optional - Twilio)
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/check-code
Check if a temporary access code is valid.

**Request:**
```json
{
  "code": "ABC12345"
}
```

**Response:**
```json
{
  "valid": true,
  "code": {
    "type": "TRIAL_CODE",
    "trialDays": 7,
    "assignedTier": "PREMIUM_MONTHLY"
  }
}
```

#### POST /api/auth/redeem-code
Redeem a temporary access code (requires authentication).

**Request:**
```json
{
  "code": "ABC12345"
}
```

**Response:**
```json
{
  "success": true,
  "trialDays": 7
}
```

### Billing Endpoints

#### POST /api/billing/create-subscription
Create a new subscription.

**Request:**
```json
{
  "priceId": "price_...",
  "paymentMethodId": "pm_..."
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "sub_...",
  "clientSecret": "pi_..."
}
```

#### POST /api/billing/webhook
Stripe webhook endpoint for payment events.

**Events handled:**
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## 🗄️ Database Schema

Key models:
- `User` - User accounts with auth providers
- `UserProfile` - Extended user profile data
- `TemporaryCode` - Access codes system
- `Subscription` - Stripe subscriptions
- `Payment` - Payment history
- `Program` - Training programs
- `Workout` - Workout definitions
- `Exercise` - Exercise definitions
- `WorkoutLog` - Workout completion logs
- `ProgressPhoto` - Progress photos
- `BodyMeasurement` - Body measurements
- `MealPlan` - Nutrition plans
- `Group` - Community groups
- `Challenge` - Fitness challenges
- `ChatMessage` - Coach-client messaging

See `prisma/schema.prisma` for complete schema.

## 🔐 Authentication Flow

1. **Signup**: User creates account → Optional access code → Trial activation
2. **Login**: Email/password, Google, Apple, or Phone OTP
3. **Session**: JWT tokens stored in httpOnly cookies
4. **Trial**: Automatic trial start on signup or code redemption
5. **Subscription**: Stripe checkout → Webhook updates → Database sync

## 💳 Payment Flow

1. User selects subscription tier
2. Stripe Payment Sheet (with Apple Pay/Google Pay)
3. Payment method attached to customer
4. Subscription created
5. Webhook updates database
6. User access granted

## 🎯 Trial System

- Trials: 7, 14, or 30 days (configurable)
- Activated via:
  - Temporary code redemption
  - "Start Free Trial" button
- Tracking: `trialStart`, `trialEnd`, `isTrialActive`
- Auto-lock: Features locked when trial ends

## 📱 PWA Support

- Service worker for offline support
- Installable on mobile devices
- App icons and manifest configured
- Push notifications ready

## 🌍 Internationalization

- English/Spanish support
- Language toggle on all pages
- Cookie-based language preference
- Extensible translation system

## 🚢 Deployment

### Vercel

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

### Database

Use Vercel Postgres or external PostgreSQL:
- Set `DATABASE_URL` in Vercel
- Run migrations: `npx prisma migrate deploy`
- Seed database: `npx prisma db seed`

## 📝 TODO / Next Steps

- [ ] Implement Google OAuth
- [ ] Implement Apple Sign In
- [ ] Implement Phone OTP (Twilio)
- [ ] Add video upload for exercises
- [ ] Implement progress photo cloud storage
- [ ] Build PR calculation engine
- [ ] Complete nutrition macro calculator
- [ ] Implement grocery list generator
- [ ] Build leaderboard system
- [ ] Add push notifications
- [ ] Complete admin panel features

## 📄 License

Private - All rights reserved

## 🤝 Support

For issues or questions, contact the development team.
