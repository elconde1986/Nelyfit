#!/bin/bash

# Auto-detect and seed production database
# This script tries to get DATABASE_URL from Vercel or prompts for it

echo "🌱 NelsyFit Production Database Seeding"
echo "========================================"
echo ""

# Try to get DATABASE_URL from Vercel CLI if available
if command -v vercel &> /dev/null; then
  echo "📦 Vercel CLI found, attempting to get DATABASE_URL..."
  vercel env pull .env.production 2>/dev/null
  if [ -f .env.production ]; then
    export $(grep DATABASE_URL .env.production | xargs)
    echo "✅ Got DATABASE_URL from Vercel"
  fi
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found automatically"
  echo ""
  echo "Please provide your production DATABASE_URL:"
  echo "1. Go to: https://vercel.com/dashboard"
  echo "2. Select your project → Settings → Environment Variables"
  echo "3. Copy the DATABASE_URL value"
  echo ""
  read -p "Enter DATABASE_URL: " db_url
  export DATABASE_URL="$db_url"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is required. Exiting."
  exit 1
fi

echo ""
echo "🚀 Starting seed with production database..."
echo ""

# Run migrations first (in case schema changed)
echo "📊 Running migrations..."
npx prisma migrate deploy

# Run seed
echo ""
echo "🌱 Seeding database..."
npx prisma db seed

echo ""
echo "✅ Done! You can now log in with:"
echo "   Email: client@nelsyfit.demo"
echo "   Password: demo"

