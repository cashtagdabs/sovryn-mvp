# SOVRYN.AI Transfer Guide - December 31, 2025

## Current State

- **Commit:** `a718ce0` (main branch)
- **Status:** Production deployment complete
- **Working Features:**
  - ✅ Chat with AI (Groq)
  - ✅ Sovereign Mode
  - ✅ GitHub OAuth
  - ✅ Database (Supabase)
  - ✅ Authentication (Clerk)

---

## To Set Up on Mac Studio

### 1. Clone the Repository

```bash
git clone https://github.com/cashtagdabs/sovryn-mvp.git
cd sovryn-mvp
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Create `.env` File

Create a file called `.env` in the project root with these values:

```env
# ⚠️ GET VALUES FROM YOUR EXISTING .env FILE
# Copy from your Windows machine at:
# c:\Users\Tyler Hoag\Tylerchoag Dropbox\Tyler Hoag\sovryn-mvp\.env

# Database
DATABASE_URL=<copy from .env>

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<copy from .env>
CLERK_SECRET_KEY=<copy from .env>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat

# AI Providers
OPENAI_API_KEY=<copy from .env>
ANTHROPIC_API_KEY=<copy from .env>
GROQ_API_KEY=<copy from .env>

# Sovereign Mode
SOVEREIGN_USER_ID=<copy from .env>

# Stripe
STRIPE_SECRET_KEY=<copy from .env>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<copy from .env>
STRIPE_WEBHOOK_SECRET=<copy from .env>
STRIPE_PRO_PRICE_ID=<copy from .env>
STRIPE_ENTERPRISE_PRICE_ID=<copy from .env>
STRIPE_SOVEREIGN_PRICE_ID=<copy from .env>

# GitHub OAuth
GITHUB_CLIENT_ID=<copy from .env>
GITHUB_CLIENT_SECRET=<copy from .env>

# PRIMEX Configuration
PRIMEX_LLM_PROVIDER=groq
OFFLINE_MODE=false
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Development Server

```bash
pnpm dev
```

---

## Vercel Environment Variables (Already Set)

These are already configured in Vercel dashboard:

- DATABASE_URL
- CLERK keys
- AI API keys (OpenAI, Anthropic, Groq)
- SOVEREIGN_USER_ID
- GitHub OAuth (production keys)

---

## Important URLs

- **Production:** https://sovryn-mvp.vercel.app
- **GitHub:** https://github.com/cashtagdabs/sovryn-mvp
- **Supabase:** https://supabase.com/dashboard/project/stuuuczkfeykfglbwefb
- **Clerk:** https://dashboard.clerk.com
- **Stripe:** https://dashboard.stripe.com

---

## Stripe Keys Issue (MUST FIX)

⚠️ Your Stripe keys are MISMATCHED:

- `STRIPE_SECRET_KEY` = `sk_live_51RbR1t...` (LIVE from account A)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_51NOQcf...` (TEST from account B)

**To fix:** Go to Stripe Dashboard → Developers → API Keys and get the matching publishable key from account `51RbR1t...`

---

## Session Summary (Dec 27-31, 2025)

### Features Implemented:

1. ✅ Fixed Stripe initialization (lazy loading)
2. ✅ Fixed database connection pooling
3. ✅ Added PRIMEX Sovereign system prompt
4. ✅ Implemented Take Over feature
5. ✅ Added Kimi AI collaboration features
6. ✅ Fixed Enter key to send messages
7. ✅ Added GitHub OAuth integration
8. ✅ Created Settings page with connected accounts
9. ✅ Fixed Groq as primary AI provider (fallback from Ollama)
10. ✅ Fixed Prisma relation names (PascalCase)

### Files Changed:

- `app/lib/db.ts` - Offline mode support
- `app/lib/ai/system-prompt.ts` - PRIMEX identity
- `app/lib/ai/router.ts` - Fallback chain
- `app/lib/ai/providers.ts` - Groq/Ollama models
- `app/api/primex/takeover/*` - Take Over feature
- `app/api/auth/github/*` - GitHub OAuth
- `app/settings/page.tsx` - Settings page
- `prisma/schema.prisma` - OAuthConnection model
