# SOVRYN/PRIMEX Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Clerk account for authentication
- At least one AI API key (OpenAI, Anthropic, or Groq)
- Stripe account for payments (optional)

### 1. Environment Setup

Create a `.env` file in the `sovryn-mvp` directory with the following:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/sovryn?schema=public"

# AI API Keys (At least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# Stripe (For payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed
```

### 3. Clerk Setup

1. Create a Clerk account at https://clerk.dev
2. Create a new application
3. Copy your API keys to `.env`
4. Set up webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
5. Enable webhook events: `user.created`, `user.updated`, `user.deleted`

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🎯 Features

### Currently Available
- ✅ Multi-model AI chat (GPT-4, Claude 3, Groq)
- ✅ Beautiful, responsive UI with animations
- ✅ User authentication with Clerk
- ✅ Conversation history and management
- ✅ Real-time streaming responses
- ✅ Code syntax highlighting
- ✅ Markdown support

### Coming Soon
- 🚧 Stripe subscription management
- 🚧 Real-time web search with citations
- 🚧 PRIMEX Sovereign AI integration
- 🚧 Prompt library and sharing
- 🚧 Team collaboration
- 🚧 API access
- 🚧 Mobile apps

## 🚢 Production Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

```bash
vercel --prod
```

### Docker

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

### Database Options

- **Supabase**: Free tier available, great for MVPs
- **Neon**: Serverless Postgres, scales to zero
- **Railway**: Simple deployment, good free tier
- **PlanetScale**: MySQL-compatible, great for scale

## 📊 Monitoring & Analytics

### Recommended Services
- **Vercel Analytics**: Built-in performance monitoring
- **PostHog**: Product analytics and feature flags
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and debugging

## 🔐 Security Best Practices

1. **API Keys**: Never commit to version control
2. **Rate Limiting**: Implement on all API routes
3. **Input Validation**: Use Zod schemas
4. **CORS**: Configure properly for production
5. **CSP Headers**: Add Content Security Policy

## 🎨 Customization

### Branding
- Update colors in `tailwind.config.js`
- Replace logo in public directory
- Modify metadata in `app/layout.tsx`

### AI Models
- Add new providers in `app/lib/ai/providers.ts`
- Implement router methods in `app/lib/ai/router.ts`

## 📱 Mobile Support

The app is fully responsive. For native apps:
- Use Capacitor or React Native
- Connect via API endpoints
- Share authentication with Clerk

## 🤝 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Discord: Coming soon

## 🚀 Launch Checklist

- [ ] Set up production database
- [ ] Configure all environment variables
- [ ] Set up Clerk production app
- [ ] Configure Stripe products/prices
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Test all features in production
- [ ] Set up backup strategy
- [ ] Create Terms of Service & Privacy Policy

## 💡 Tips for Success

1. **Start with Free Tiers**: Most services offer generous free tiers
2. **Monitor Costs**: Set up billing alerts for all services
3. **Cache Aggressively**: Reduce API calls with smart caching
4. **Progressive Enhancement**: Launch with core features, iterate
5. **User Feedback**: Build feedback loops early

Ready to change the world of AI! 🚀
