# Sovryn MVP - Integration Test Checklist

## 🎯 Goal
Verify that all components (Clerk Auth, Prisma DB, Dashboard, Chat API, Stripe) work together end-to-end with real data flowing correctly.

---

## Phase 1: Authentication & Setup

- [ ] **Sign In**
  - Go to http://localhost:3000/sign-in
  - Create or sign in with a test account
  - Check: User is authenticated in Clerk

- [ ] **Get Clerk ID**
  - Navigate to http://localhost:3000/debug (if available)
  - Or: Open browser DevTools → Application → Local Storage → Look for Clerk session data
  - Copy your Clerk ID (format: `user_*`)

- [ ] **Grant SOVEREIGN Access**
  - Run the grant-access curl command with your Clerk ID
  - Verify response: `{ "success": true, "message": "SOVEREIGN access granted" }`
  - Check: User record created in Prisma (`npx prisma studio` → Users table)

---

## Phase 2: Dashboard & Data Fetching

- [ ] **Dashboard Loads**
  - After sign-in, navigate to http://localhost:3000/dashboard
  - Verify page renders without errors

- [ ] **Personalization**
  - Check: Your first name appears in greeting ("Welcome back, [Name]!")
  - Check: Avatar from Clerk displays
  - Check: Badges show (Level, Streak, Premium Member)

- [ ] **Usage Data Fetch**
  - Open browser DevTools → Network tab
  - Refresh dashboard
  - Find `GET /api/user/usage` request
  - Check: Response status is 200 and contains `{ usage: { ... } }`
  - Check: Loading state cleared after fetch

- [ ] **Quick Stats Display**
  - Verify 5 stat cards render: Chats, Models, Tokens, Response (ms), Satisfaction
  - If `usageData` is empty, values should show 0 as fallback
  - Check: No console errors related to undefined properties

- [ ] **Analytics Widgets**
  - Verify 3-column grid with:
    - StreakWidget (current/longest/days active)
    - LevelingWidget (level/XP/progress)
    - AchievementWidget (achievement icons/progress)
  - All should use fallback values initially

- [ ] **Engagement Summary**
  - Verify detailed metrics card loads
  - Check: All stat widgets have proper styling

- [ ] **Theme Switcher**
  - Top-right corner: Click each theme button (Dark, Light, Gradient, Glass)
  - Verify: Page theme changes visually
  - Verify: Theme persists on page refresh (stored in localStorage via ThemeProvider)

---

## Phase 3: Chat Feature

- [ ] **Chat Page Loads**
  - Navigate to http://localhost:3000/chat
  - Verify: Chat interface renders

- [ ] **Send Message**
  - Type a test message (e.g., "Hello, Sovryn!")
  - Click Send or press Enter
  - Verify: Message appears in chat UI with your user data

- [ ] **AI Response**
  - Verify: Streaming response comes back from AI model
  - Check: Appears in chat UI in real-time
  - Check: Model selector works (if implemented)

- [ ] **Message Persistence**
  - Open http://localhost:3000/app/local/content/static/prisma/studio
  - Or: Run `npx prisma studio` in terminal
  - Navigate to `Message` table
  - Verify: Your message(s) appear with correct data (content, sender, conversationId, etc.)

- [ ] **Conversation Listing**
  - Check: Sidebar shows conversation list
  - Verify: Messages persist across refreshes
  - Test: Can switch between conversations

---

## Phase 4: Usage Tracking

- [ ] **Chat Count Updates**
  - Send 2-3 more messages in chat
  - Return to dashboard (or refresh it)
  - Verify: `usageData?.usage?.chatCount` incremented
  - Expected: Shows 3+ chats

- [ ] **Tokens Processed Updates**
  - Send a longer message (to process more tokens)
  - Return to dashboard
  - Verify: `tokensProcessed` increased

- [ ] **Models Used**
  - If multiple models available, try switching models and chatting
  - Return to dashboard
  - Verify: `modelsUsed` count reflects unique models

- [ ] **Usage API Endpoint**
  - Directly call: `curl http://localhost:3000/api/user/usage` (while authenticated)
  - Check: Response includes `{ usage: { chatCount, modelsUsed, tokensProcessed, ... } }`

---

## Phase 5: Subscription & Stripe

- [ ] **Subscription Page Loads**
  - Navigate to http://localhost:3000/subscription
  - Verify: Plan cards display (Free, Pro, Sovereign, etc.)

- [ ] **Subscribe Button**
  - Click "Subscribe to [Plan]" (e.g., Pro)
  - Verify: Redirected to Stripe Checkout (test mode)

- [ ] **Stripe Payment**
  - Use test card: `4242 4242 4242 4242`
  - Expiry: Any future date (e.g., 12/26)
  - CVC: Any 3 digits (e.g., 123)
  - Email: Your email or test email
  - Click "Pay"
  - Verify: Payment succeeds and redirects back to app

- [ ] **Database Subscription Record**
  - Run `npx prisma studio` → Subscription table
  - Verify: New subscription record created with:
    - Correct user ID
    - Plan name matches selected tier
    - Status = "ACTIVE" or "TRIALING"
    - Created/Updated timestamps

- [ ] **Stripe Webhook**
  - Go to Stripe Dashboard → Webhooks
  - Look for recent `charge.succeeded` or `customer.subscription.created` events
  - Verify: Webhook was delivered successfully (status 200)

---

## Phase 6: End-to-End Flow

- [ ] **Full User Journey**
  1. Sign out completely
  2. Sign back in with a new/different account
  3. Grant SOVEREIGN access for new account
  4. Dashboard loads with new user data
  5. Send chat message
  6. Check usage updated
  7. Visit subscription
  8. Complete a test purchase
  9. Verify subscription applies (if gating logic exists)

- [ ] **Data Isolation**
  - Ensure user A's chat/usage is not visible to user B
  - Run `npx prisma studio` → Verify data has correct userId foreign keys

---

## Phase 7: Error Handling

- [ ] **Missing Auth**
  - Try accessing /dashboard without signing in
  - Expected: Redirected to /sign-in (or show auth error)

- [ ] **API Failures**
  - Temporarily disable database connection (e.g., wrong DATABASE_URL)
  - Refresh dashboard
  - Verify: Error message shows ("Error loading usage: ...") instead of crashing

- [ ] **Chat API Errors**
  - Try sending a message without valid AI provider key
  - Expected: Error message in chat ("Failed to get response")

- [ ] **Stripe Errors**
  - Cancel a Stripe payment mid-transaction
  - Verify: App handles gracefully (shows error, no orphan records)

---

## Phase 8: Performance & Browser Compatibility

- [ ] **Load Times**
  - Dashboard should load in < 2 seconds
  - Chat should stream responses smoothly
  - Check Lighthouse scores (DevTools → Lighthouse)

- [ ] **Responsive Design**
  - Test on mobile (DevTools device emulation)
  - Verify: Layout adjusts correctly
  - Check: Buttons/inputs are touch-friendly

- [ ] **Cross-Browser**
  - Test in Chrome, Safari, Firefox
  - Verify: All features work consistently

---

## Phase 9: Production Readiness

- [ ] **Environment Variables**
  - Verify all required `.env` variables are set:
    - CLERK_SECRET_KEY ✓
    - STRIPE_SECRET_KEY ✓
    - DATABASE_URL (non-pooling) ✓
    - AI provider keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.) ✓
    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ✓
    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ✓

- [ ] **Build for Production**
  - Run: `npm run build`
  - Verify: No errors
  - Check: Build output includes all assets

- [ ] **Start Production Build**
  - Run: `npm start` (or Vercel preview)
  - Verify: App serves correctly
  - Repeat key tests (sign-in, chat, subscription) on prod build

---

## Phase 10: Launch Readiness

- [ ] **Code Review**
  - All console errors cleared
  - No sensitive data in logs or client code
  - Stripe/Clerk keys properly separated (client vs server)

- [ ] **Git Status**
  - All changes committed
  - Pushed to main branch (if using GitHub)

- [ ] **Vercel Deployment**
  - Environment variables set in Vercel Dashboard
  - Deployment succeeds without errors
  - Live site reachable and functional

- [ ] **DNS & Custom Domain** (if applicable)
  - Custom domain points to Vercel
  - HTTPS certificate configured
  - Live site accessible via custom domain

---

## 🎉 Success Criteria

When all checks above are complete, your Sovryn MVP is **production-ready**:

✅ Users can sign in and authenticate
✅ Dashboard displays real, personalized data
✅ Chat works with real AI responses and persistence
✅ Usage is tracked accurately
✅ Subscriptions process through Stripe
✅ Data is isolated per user
✅ App handles errors gracefully
✅ Performance is acceptable
✅ Production build and deployment work

---

## 📝 Notes

- **Prisma Studio**: Always run `npx prisma studio` to inspect live data during testing
- **Stripe Test Mode**: Use test cards and keys during development; switch to live keys for production
- **Clerk Sessions**: Check browser storage/cookies to debug authentication issues
- **Database Logs**: Check Supabase logs for connection/query errors
- **Vercel Logs**: After deployment, monitor Vercel Dashboard → Deployments → Logs

Good luck! 🚀
