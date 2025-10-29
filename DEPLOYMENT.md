# SOVRYN/PRIMEX Production Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
1. GitHub repository with your code
2. Vercel account (free)
3. Production database (Supabase/Neon recommended)
4. API keys for all services

### Step 1: Database Setup

**Recommended: Supabase (Free tier available)**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy your connection string
5. Replace with your values:
```
postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
```

**Alternative: Neon (Generous free tier)**

1. Go to [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string

### Step 2: Vercel Deployment

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Choose the `sovryn-mvp` folder as the root directory

2. **Environment Variables**
   Add these in Vercel dashboard (Settings > Environment Variables):

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# AI APIs (at least one required)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."

# Stripe (for subscriptions)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."
STRIPE_SOVEREIGN_PRICE_ID="price_..."

# App Config
NEXT_PUBLIC_APP_URL="https://yourapp.vercel.app"
```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://yourapp.vercel.app`

### Step 3: Database Migration

After first deployment:

1. Go to your Vercel deployment dashboard
2. Go to Functions tab
3. Create a new serverless function or use the terminal:

```bash
# In your local environment
npm run db:migrate
```

### Step 4: Clerk Configuration

1. **Clerk Dashboard**
   - Add your production URL to allowed origins
   - Set up webhooks endpoint: `https://yourapp.vercel.app/api/webhooks/clerk`
   - Enable events: `user.created`, `user.updated`, `user.deleted`

2. **Test Authentication**
   - Visit your live site
   - Try signing up/in
   - Verify user creation in database

### Step 5: Stripe Configuration

1. **Create Products**
   ```bash
   # Use Stripe CLI or dashboard to create:
   - Pro Plan ($20/month)
   - Enterprise Plan ($99/month) 
   - Sovereign Plan ($499/month)
   ```

2. **Webhook Endpoint**
   - Add `https://yourapp.vercel.app/api/webhooks/stripe`
   - Select events: `customer.subscription.*`, `invoice.payment_*`

3. **Test Payments**
   - Use Stripe test cards
   - Verify subscription creation

### Step 6: Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to Settings > Domains
   - Add your custom domain
   - Follow DNS instructions

2. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL="https://sovryn.ai"
   ```

3. **Update Clerk & Stripe**
   - Add new domain to Clerk allowed origins
   - Update webhook URLs to use custom domain

---

## 🔧 Alternative Deployment Options

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t sovryn-primex .
docker run -p 3000:3000 --env-file .env sovryn-primex
```

### Railway Deployment

1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

### AWS/GCP Deployment

Use platforms like:
- **AWS Amplify**
- **Google Cloud Run**
- **DigitalOcean App Platform**

---

## 📊 Monitoring Setup

### Vercel Analytics (Built-in)
- Automatically enabled
- View in Vercel dashboard
- Real-time metrics

### Error Monitoring
- Sentry integration included
- Set `SENTRY_DSN` environment variable
- Monitor errors in production

### Database Monitoring
- Use your database provider's monitoring
- Set up alerts for usage/performance
- Monitor connection limits

---

## 🔒 Security Checklist

- [ ] All environment variables are secure
- [ ] Database has SSL enabled
- [ ] Webhook endpoints have proper verification
- [ ] API keys have minimal required permissions
- [ ] Content Security Policy configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] User input sanitized

---

## 🧪 Testing in Production

### 1. Authentication Flow
```bash
# Test signup/login
curl -X POST https://yourapp.vercel.app/api/test-auth
```

### 2. AI Chat Functionality
- Test all available models
- Verify streaming works
- Check conversation persistence

### 3. Subscription Flow
- Test subscription creation
- Verify webhook handling
- Test billing portal

### 4. Usage Limits
- Test free tier limits
- Verify upgrade prompts
- Test model restrictions

---

## 🚨 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check connection string format
# Ensure IP whitelist includes Vercel IPs
```

**Webhook Failures**
```bash
# Verify webhook URLs
# Check webhook signatures
# Review webhook logs in Stripe/Clerk
```

**Build Failures**
```bash
# Check Node.js version (use 18+)
# Verify all dependencies installed
# Check TypeScript errors
```

### Debug Tools

**Vercel Logs**
```bash
vercel logs https://yourapp.vercel.app
```

**Database Logs**
```bash
# Check your database provider's logs
# Monitor connection counts
```

---

## 📈 Scaling Considerations

### Performance Optimization
- Enable Next.js Image Optimization
- Use CDN for static assets
- Implement caching strategies
- Monitor Core Web Vitals

### Database Scaling
- Connection pooling (PgBouncer)
- Read replicas for heavy reads
- Index optimization
- Query performance monitoring

### Cost Management
- Monitor API usage and costs
- Set up billing alerts
- Optimize AI model selection
- Cache frequently used data

---

## 🎯 Go-Live Checklist

- [ ] Domain configured and SSL active
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Clerk authentication working
- [ ] Stripe subscriptions working  
- [ ] All AI models accessible
- [ ] Webhooks properly configured
- [ ] Monitoring and analytics active
- [ ] Error tracking enabled
- [ ] Backup strategy in place
- [ ] Terms of Service & Privacy Policy added
- [ ] Load testing completed
- [ ] Security audit passed

**Ready to launch! 🚀**

Your SOVRYN/PRIMEX AI platform is now production-ready and will be the #1 AI app in the world! 🌍
