# SOVRYN LAUNCH CHECKLIST

**Goal: Get live and making money THIS WEEK**

---

## Pre-Launch Setup (Do Once)

### 1. Stripe Setup (30 minutes)

Go to [Stripe Dashboard](https://dashboard.stripe.com) and create these products:

| Product Name | Price | Price ID Variable |
|--------------|-------|-------------------|
| Sovryn Starter | $29/month | `STRIPE_STARTER_PRICE_ID` |
| Sovryn Professional | $79/month | `STRIPE_PROFESSIONAL_PRICE_ID` |
| Sovryn Sovereign | $299/month | `STRIPE_SOVEREIGN_PRICE_ID` |
| Sovryn Enterprise | $999/month | `STRIPE_ENTERPRISE_PRICE_ID` |

**Steps:**
1. Go to Products → Add Product
2. Name: "Sovryn Starter" (or Professional, etc.)
3. Pricing: Recurring, Monthly, $29 (or appropriate price)
4. Click Create
5. Copy the Price ID (starts with `price_`)
6. Add to your `.env` file

### 2. Clerk Setup (15 minutes)

Go to [Clerk Dashboard](https://dashboard.clerk.dev):

1. Create application (if not done)
2. Get your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Set up webhook:
   - Go to Webhooks → Add Endpoint
   - URL: `https://yourdomain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy `CLERK_WEBHOOK_SECRET`

### 3. Database Setup (10 minutes)

**Option A: Supabase (Recommended)**
1. Go to [Supabase](https://supabase.com)
2. Create project
3. Go to Settings → Database → Connection string
4. Copy the URI to `DATABASE_URL`

**Option B: Neon**
1. Go to [Neon](https://neon.tech)
2. Create project
3. Copy connection string to `DATABASE_URL`

### 4. AI API Keys (10 minutes)

Get at least ONE of these:

| Provider | Get Key | Variable |
|----------|---------|----------|
| Groq (FREE!) | [console.groq.com](https://console.groq.com) | `GROQ_API_KEY` |
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) | `OPENAI_API_KEY` |
| Anthropic | [console.anthropic.com](https://console.anthropic.com) | `ANTHROPIC_API_KEY` |

**Recommendation:** Start with Groq - it's FREE and fast.

---

## Environment Variables

Create `.env` with these values:

```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_SOVEREIGN_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# AI (at least one)
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=https://sovryn.ai
```

---

## Deploy to Vercel (15 minutes)

### Step 1: Push to GitHub
```bash
cd sovryn-mvp
git add -A
git commit -m "Launch ready"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your `sovryn-mvp` repo
4. Add ALL environment variables from above
5. Click Deploy

### Step 3: Set Up Webhooks
After deployment, update webhook URLs:

**Stripe:**
1. Go to Stripe → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

**Clerk:**
1. Go to Clerk → Webhooks
2. Update endpoint URL to your production domain

### Step 4: Run Database Migration
```bash
npx prisma db push
```

---

## Post-Deploy Verification

### Quick Tests (5 minutes)

- [ ] Landing page loads at `yourdomain.com`
- [ ] Sign up works
- [ ] Sign in works
- [ ] Chat interface loads
- [ ] Can send a message and get response
- [ ] Subscription page shows all 4 tiers
- [ ] Stripe checkout opens when clicking upgrade

### Payment Test

1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future date, any CVC
3. Verify subscription activates

---

## Launch Day Actions

### 1. Switch to Live Mode
- Stripe: Switch from test to live keys
- Update all `sk_test_` to `sk_live_`
- Update all `pk_test_` to `pk_live_`
- Create live webhook endpoints

### 2. Domain Setup
- Point your domain to Vercel
- Add domain in Vercel project settings
- Update `NEXT_PUBLIC_APP_URL`

### 3. Announce
- Post on X/Twitter
- Post on relevant subreddits
- Email your list (if you have one)

---

## Revenue Tracking

Set up these in Stripe Dashboard:
- Revenue reports
- Subscription metrics
- Churn tracking

---

## Support Channels

Before launch, set up:
- [ ] Support email (support@sovryn.ai)
- [ ] Discord server (optional but recommended)
- [ ] FAQ page (already in landing page)

---

## Emergency Contacts

If something breaks:
- Vercel Status: status.vercel.com
- Stripe Status: status.stripe.com
- Clerk Status: status.clerk.com

---

**YOU'RE READY. LAUNCH IT.**
