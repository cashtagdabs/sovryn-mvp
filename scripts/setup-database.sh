#!/bin/bash
# Database Setup Script for SOVRYN.AI + PRIMEX

echo "🗄️  Setting up database for SOVRYN.AI + PRIMEX"
echo "=============================================="
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

cd "$PROJECT_ROOT" || exit 1

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

# Source environment variables
source .env

echo "📦 Installing Prisma CLI..."
npm install -D prisma

echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🔄 Running database migrations..."

# Check if using PostgreSQL or SQLite
if [[ $DATABASE_URL == postgresql* ]]; then
    echo "Detected PostgreSQL database"
    npx prisma migrate deploy
else
    echo "Detected SQLite database (development mode)"
    npx prisma migrate dev --name init
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Optional: Run 'npx prisma studio' to open database GUI"
echo ""
