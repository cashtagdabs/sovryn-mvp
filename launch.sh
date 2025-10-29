#!/bin/bash

# SOVRYN/PRIMEX Launch Script
# Easy one-command startup for development

echo "🚀 SOVRYN/PRIMEX Launch Sequence Initiated..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
else
  echo "✅ Dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  No .env file found!"
  echo "📝 Please create a .env file with your API keys:"
  echo ""
  echo "Required variables:"
  echo "- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  echo "- CLERK_SECRET_KEY"
  echo "- DATABASE_URL"
  echo "- At least one AI API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GROQ_API_KEY)"
  echo ""
  echo "See SETUP.md for detailed instructions."
  exit 1
fi

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check database connection and run migrations
echo ""
echo "🗄️  Setting up database..."
npx prisma migrate deploy 2>/dev/null || {
  echo "⚠️  No existing migrations found. Running initial migration..."
  npx prisma migrate dev --name init
}

# Start the development server
echo ""
echo "✨ Starting SOVRYN/PRIMEX..."
echo "🌐 Opening http://localhost:3000"
echo ""
echo "🎯 Ready to change the world of AI!"
echo ""

# Open browser (works on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
  sleep 3 && open http://localhost:3000 &
fi

# Start the server
npm run dev
