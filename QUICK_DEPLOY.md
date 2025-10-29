# 🚀 SOVRYN/PRIMEX Quick Deploy to Production
## Get Live in 30 Minutes

---

## Step 1: Database Setup (5 minutes)

### Option A: Supabase (Recommended - Free Tier Available)
1. Go to https://supabase.com
2. Sign up and create a new project
3. Copy your connection string from Settings → Database
4. It will look like: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

### Option B: Neon (Great Free Tier)
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy your connection string
4. It will look like: `postgresql://[USER]:[PASSWORD]@[HOST]/neondb`

---

## Step 2: Deploy to Vercel (10 minutes)

### Via Vercel Dashboard:
1. Push your code to GitHub (if not already)
2. Go to https://vercel.com
3. Click "Add New" → "Project"
4. Import your `sovryn-mvp` repository
5. Set Root Directory to `sovryn-mvp`

### Environment Variables:
Add these in Vercel Settings → Environment Variables:

```bash
# Database
DATABASE_URL="postgresql://..." # from Step 1

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# AI APIs (at least one)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (create these after basic setup)
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."
STRIPE_SOVEREIGN_PRICE_ID="price_..."

# App
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

3. Click "Deploy"
4. Wait 2-3 minutes for build to complete
5. Your app is LIVE! 🎉

---

## Step 3: Configure Clerk (5 minutes)

1. Go to https://clerk.com
2. Create a new application
3. Copy your API keys to Vercel environment variables
4. Add your Vercel URL to Allowed Origins
5. Set up webhook: `https://your-app.vercel.app/api/webhooks/clerk`
6. Enable events: `user.created`, `user.updated`, `user.deleted`

---

## Step 4: Database Migration (5 minutes)

Run this command in Vercel Functions or via Terminal:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

Or manually via Supabase/Neon dashboard SQL editor.

---

## Step 5: Configure Stripe (5 minutes)

1. Go to https://dashboard.stripe.com
2. Create Products & Prices:
   - Pro: $20/month
   - Enterprise: $99/month
   - Sovereign: $499/month
3. Copy Price IDs to Vercel environment variables
4. Add webhook endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
5. Select events: `customer.subscription.*`, `invoice.payment_*`

---

## 🎉 You're Live!

Visit `https://your-app.vercel.app`

### Next: First User Testing
1. Sign up for an account
2. Test all AI models
3. Try creating a conversation
4. Test subscription flow (use test mode)
5. Verify everything works

---

## 🚨 If Something Goes Wrong

### Database Connection Issues
- Check DATABASE_URL format
- Verify IP whitelist (Supabase)
- Check SSL mode

### Authentication Issues
- Verify Clerk keys are correct
- Check webhook URLs
- Ensure environment variables loaded

### AI Model Errors
- Verify API keys are valid
- Check API quota/limits
- Review Vercel logs

### Payment Issues
- Use Stripe test mode first
- Verify webhook signatures
- Check Stripe logs

---

## 📞 Support

- Check Vercel logs: `vercel logs`
- Check database logs in provider dashboard
- Review environment variables
- Check API status for all services

---

## 🎯 Post-Deployment Tasks

- [ ] Test signup/login flow
- [ ] Test AI chat functionality
- [ ] Test subscription creation
- [ ] Verify webhooks are working
- [ ] Set up custom domain
- [ ] Configure analytics
- [ ] Send first marketing email

**You're now LIVE and ready to grow! 🚀**
