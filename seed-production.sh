#!/bin/bash

# Production Database Seed Script
# This script helps you seed the production database

echo "🌱 NelsyFit Production Database Seeding"
echo "========================================"
echo ""
echo "This will seed your production database with test accounts and data."
echo ""
echo "⚠️  WARNING: This will add/update data in your PRODUCTION database!"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable is not set."
  echo ""
  echo "To get your production DATABASE_URL:"
  echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
  echo "2. Select your project"
  echo "3. Go to Settings → Environment Variables"
  echo "4. Copy the DATABASE_URL value"
  echo ""
  echo "Then run:"
  echo "  export DATABASE_URL='your-production-database-url-here'"
  echo "  ./seed-production.sh"
  echo ""
  exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""
echo "Database URL: ${DATABASE_URL:0:30}..."
echo ""
read -p "Continue with seeding? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Seeding cancelled"
  exit 0
fi

echo ""
echo "🚀 Starting seed..."
echo ""

# Run the seed command
npx prisma db seed

echo ""
echo "✅ Seed completed!"
echo ""
echo "Test accounts created:"
echo "  - Admin: admin@nelsyfit.demo / demo"
echo "  - Coach: coach@nelsyfit.demo / demo"
echo "  - Client: client@nelsyfit.demo / demo"
echo ""
echo "You can now log in to your production app!"

