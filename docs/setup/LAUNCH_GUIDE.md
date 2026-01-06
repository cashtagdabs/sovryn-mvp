# Sovryn MVP - Quick Setup & Launch Guide

## ✅ Current Status
- **Dev Server**: Running on `http://localhost:3000`
- **Build**: ✓ Successful (all fixes applied)
- **Database**: Connected to Supabase with correct non-pooling URL
- **Prisma**: ✓ Initialized and ready
- **Stripe**: ✓ Server/client separation complete

## 🚀 Next Steps to Launch

### Step 1: Sign In & Get Your Clerk ID
1. Visit: **http://localhost:3000/sign-in**
2. Create an account with your emailpage
3. After signing in, visit: **http://localhost:3000/debug**
4. Copy your **Clerk ID** from the debug 

### Step 2: Grant Yourself SOVEREIGN Access (Full Testing)

Run this in your terminal (replace `YOUR_CLERK_ID` with the one you copied):

```bash
curl -X POST http://localhost:3000/api/admin/grant-access \
  -H "Authorization: Bearer dev-secret-key-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "clerkId": "YOUR_CLERK_ID",
    "email": "your-email@example.com",
    "name": "Your Name",
    "plan": "SOVEREIGN"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "SOVEREIGN access granted",
  "user": { ... },
  "subscription": {
    "plan": "SOVEREIGN",
    "status": "ACTIVE"
  }
}
```

### Step 3: Dashboard Integration Test
1. After signing in, you should be automatically redirected to **http://localhost:3000/dashboard**
2. Verify:
   - **Personalized Greeting**: Shows your first name (e.g., "Welcome back, [Name]!")
   - **Profile Card**: Avatar from Clerk, badges for level/streak
   - **Quick Stats Grid**: Shows 5 stat cards (Chats, Models, Tokens, Response Time, Satisfaction)
     - If loading: Shows "Loading your usage…" while fetching `/api/user/usage`
     - If error: Shows error message in red
     - If success: Displays real metrics from the database
   - **Analytics Section**: 3 widgets showing Streak, Leveling, and Achievements
   - **Engagement Summary**: Detailed metrics for chats, models, tokens processed
   - **Theme Switcher**: Top-right buttons to toggle Dark/Light/Gradient/Glass themes
   
3. Check browser Network tab:
   - Look for `GET /api/user/usage` call
   - Response should include: `{ usage: { currentStreak, chatCount, modelsUsed, tokensProcessed, ... } }`
   - Status should be 200 (or 401 if not authenticated)

4. Verify Real Data Wiring:
   - Go to **http://localhost:3000/chat** and send a message
   - Return to dashboard
   - **Chat count** should increment (refresh page to see updated value)
   - Open Prisma Studio (`npx prisma studio`) to confirm the message was saved

### Step 4: Test Chat Feature
1. Visit: **http://localhost:3000/subscription**
2. Click "Subscribe to [Plan]"
3. You'll be redirected to Stripe test payment
4. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
5. Verify:
   - Payment succeeds in Stripe
   - Database updates with subscription info
   - Webhook triggers (check Stripe Dashboard → Webhooks)

### Step 5: Deploy to Vercel

#### Option A: Push to GitHub & Redeploy
```bash
git add -A
git commit -m "feat: complete Sovryn MVP with chat and subscriptions"
git push origin main
```

Then in Vercel Dashboard:
- Go to your project settings
- Ensure **Environment Variables** include:
  - All `NEXT_PUBLIC_*` keys
  - `CLERK_SECRET_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `DATABASE_URL` (non-pooling Supabase URL)
  - AI provider keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, GROQ_API_KEY)
- Redeploy (automatically happens on push)

#### Option B: Manual Vercel Deploy
```bash
npm install -g vercel
vercel --prod
```

## 📋 Key Files Modified

- **`.env.local`**: DATABASE_URL now uses non-pooling Supabase endpoint
- **`app/lib/db.ts`**: Lazy Prisma initialization to avoid build-time errors
- **`app/lib/stripe.ts`**: Client-safe (no secrets)
- **`app/lib/stripe.server.ts`**: Server-only Stripe operations
- **`app/api/admin/grant-access/route.ts`**: Grant tier access to users
- **`app/debug/page.tsx`**: Get your Clerk ID for testing

## 🔧 Troubleshooting

### Chat not working?
- Check browser DevTools Console for errors
- Verify `OPENAI_API_KEY` (or other AI provider) is set in `.env.local`
- Make sure you have SOVEREIGN access (run grant-access command)

### Subscriptions not working?
- Verify `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in env
- Check Stripe Dashboard → Webhooks for the webhook endpoint
- Ensure webhook secret matches `STRIPE_WEBHOOK_SECRET`

### Database errors?
- Verify `DATABASE_URL` is using the **non-pooling** Supabase URL (port 5432, not 6543)
- Run `npx prisma db push` to sync schema if needed
- Check Supabase Dashboard for connection logs

## 📊 Monitoring in Production

After deploying to Vercel:
- **Chat Usage**: `npx prisma studio` → View `Message` and `Conversation` tables
- **Subscriptions**: Check Stripe Dashboard for payment history
- **Errors**: Vercel Dashboard → Deployments → Logs
- **Database**: Supabase Dashboard → SQL Editor for direct queries

## 🎯 Success Checklist

- [ ] Sign in works with Clerk
- [ ] Got your Clerk ID from /debug
- [ ] Granted SOVEREIGN access (API call successful)
- [ ] Chat sends message and gets response
- [ ] Conversation saves to database
- [ ] Subscriptions page loads
- [ ] Can initiate Stripe payment
- [ ] Payment processes successfully
- [ ] Database subscription updated
- [ ] Deployed to Vercel
- [ ] Live site works end-to-end

## 🚀 You're Ready for Launch!

Once all checkboxes are done:
1. Update DNS if using custom domain
2. Set up analytics (Vercel Analytics, or Google Analytics)
3. Configure Stripe Live Keys (when ready for real money)
4. Update ADMIN_SECRET to a secure token for production
5. Monitor logs and metrics in production

Good luck! 🎉
