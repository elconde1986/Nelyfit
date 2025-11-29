#!/bin/bash

# Automated Production Database Seeding via Vercel
# This script attempts to get DATABASE_URL from Vercel and seed the database

echo "🌱 NelsyFit Production Database Seeding"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found"
  echo ""
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

# Check if logged in to Vercel
echo "📦 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
  echo "❌ Not logged in to Vercel"
  echo "Please run: vercel login"
  exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Pull production environment variables
echo "📥 Pulling production environment variables from Vercel..."
vercel env pull .env.production --environment=production --yes

if [ ! -f .env.production ]; then
  echo "❌ Failed to pull environment variables"
  exit 1
fi

# Extract DATABASE_URL
export $(grep DATABASE_URL .env.production | xargs)

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in Vercel environment variables"
  echo ""
  echo "Please add DATABASE_URL to Vercel:"
  echo "1. Go to: https://vercel.com/dashboard"
  echo "2. Select your project → Settings → Environment Variables"
  echo "3. Add DATABASE_URL for Production environment"
  exit 1
fi

echo "✅ Found DATABASE_URL"
echo ""

# Run migrations
echo "📊 Running migrations..."
npx prisma migrate deploy

# Run seed
echo ""
echo "🌱 Seeding production database..."
npx prisma db seed

echo ""
echo "✅ Production database seeded successfully!"
echo ""
echo "You can now log in with:"
echo "  Email: client@nelsyfit.demo"
echo "  Password: demo"
echo ""
echo "⚠️  Remember to delete .env.production file after seeding for security!"

