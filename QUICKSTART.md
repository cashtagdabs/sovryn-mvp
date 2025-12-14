# SOVRYN.AI + PRIMEX Quick Start Guide

Get your integrated AI platform running in under 30 minutes.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ Python 3.11+ installed (`python3 --version`)
- ✅ Git installed (`git --version`)
- ✅ At least 8GB RAM available
- ✅ 50GB+ free disk space

## Step 1: Install Ollama (5 minutes)

Ollama powers the PRIMEX AI agents. Install it with:

```bash
curl https://ollama.ai/install.sh | sh
```

Verify installation:
```bash
ollama --version
```

## Step 2: Clone & Setup Project (5 minutes)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/sovryn-ai-integrated.git
cd sovryn-ai-integrated

# Install Node.js dependencies
npm install

# Setup PRIMEX backend
cd primex-backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

## Step 3: Setup Ollama Models (10 minutes)

This downloads the AI models for PRIMEX clones:

```bash
cd primex-backend
bash scripts/setup-ollama.sh
```

This will:
- Download llama3.2:3b (~2GB)
- Download mistral:7b (~4GB)
- Create custom PRIMEX clone models

## Step 4: Configure Environment (5 minutes)

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` and add your API keys:

### Required for Public Mode:
```bash
# Get from https://clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Get from https://stripe.com
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Get from https://platform.openai.com
OPENAI_API_KEY="sk-..."
```

### Required for Sovereign Mode:
```bash
# Your Clerk user ID (get from Clerk dashboard after signing up)
SOVEREIGN_USER_ID="user_..."

# PRIMEX backend URL
PRIMEX_API_URL="http://localhost:8000"
```

### Database:
```bash
# For local development, use SQLite (already configured)
# For production, use Supabase or Neon
DATABASE_URL="postgresql://..."
```

## Step 5: Setup Database (2 minutes)

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

## Step 6: Start Everything (1 minute)

### Option A: One-Command Startup (Recommended)
```bash
bash scripts/start-local.sh
```

### Option B: Manual Startup
Terminal 1 - PRIMEX Backend:
```bash
cd primex-backend
source venv/bin/activate
uvicorn services.clone-orchestrator:app --reload
```

Terminal 2 - Next.js Frontend:
```bash
npm run dev
```

## Step 7: Access Your Platform

Open your browser and visit:

### Public Mode (SOVRYN.AI):
- **Frontend**: http://localhost:3000
- Sign up with Clerk
- Start chatting with AI models

### Sovereign Mode (PRIMEX):
- **PRIMEX Interface**: http://localhost:3000/primex
- Requires your user ID to be set as SOVEREIGN_USER_ID
- Access all 6 specialized AI clones

### API Documentation:
- **PRIMEX API Docs**: http://localhost:8000/docs
- Interactive API documentation

## Testing PRIMEX Clones

Test the clones directly via Ollama:

```bash
# Test ARCHITECT
ollama run architect "Design a secure API authentication system"

# Test CORTEX
ollama run cortex "Analyze the risk/reward of launching MVP now vs waiting 2 months"

# Test CENTURION
ollama run centurion "Audit this deployment plan for security vulnerabilities"
```

## Getting Your Sovereign User ID

1. Start the application and sign up at http://localhost:3000
2. Go to Clerk Dashboard → Users
3. Click on your user
4. Copy the User ID (starts with `user_`)
5. Add it to `.env` as `SOVEREIGN_USER_ID`
6. Restart the application
7. Access http://localhost:3000/primex

## Troubleshooting

### "Ollama not found"
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

### "Port 8000 already in use"
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn services.clone-orchestrator:app --port 8001
```

### "Clone not responding"
```bash
# Check Ollama status
ollama list

# Recreate clone
cd primex-backend/ollama/clone-prompts
ollama create architect -f architect.Modelfile
```

### "Database connection failed"
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### "Access denied to PRIMEX"
- Verify your SOVEREIGN_USER_ID in .env matches your Clerk user ID
- Restart the application after changing .env
- Check browser console for errors

## Next Steps

### For Development:
1. Explore the codebase in `app/` and `primex-backend/`
2. Customize AI clone behaviors in `primex-backend/config/clones/`
3. Add new features to the frontend
4. Test multi-agent workflows

### For Production:
1. Follow `DEPLOY_NOW.md` for Vercel deployment
2. Set up VPS for PRIMEX backend
3. Configure production database (Supabase/Neon)
4. Set up domain and SSL
5. Configure Stripe products and pricing

## Quick Reference

### Start Development:
```bash
bash scripts/start-local.sh
```

### Stop All Services:
```bash
# Press Ctrl+C in the terminal running start-local.sh
```

### Update Dependencies:
```bash
npm install  # Frontend
cd primex-backend && pip install -r requirements.txt  # Backend
```

### Database Commands:
```bash
npx prisma studio  # Open database GUI
npx prisma migrate dev  # Create new migration
npx prisma generate  # Regenerate client
```

## Support

- **Documentation**: See README.md for detailed information
- **Issues**: Use GitHub Issues for bug reports
- **Owner**: Contact Tyler C. Hoag directly

---

**Ready to build? Let's go! 🚀**
