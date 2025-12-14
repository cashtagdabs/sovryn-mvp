# SOVRYN.AI + PRIMEX - Comprehensive FAQ

**Everything you need to know about your integrated AI platform**

---

## 🏗️ **ABOUT THE SYSTEM**

### How does the dual-mode architecture work?

The system operates as a single unified application with two distinct operational modes that share the same codebase, database, and authentication system but provide completely different user experiences and capabilities.

**Public Mode (SOVRYN.AI)** is accessible to all authenticated users. When users sign in, they land in the standard chat interface where they can interact with cloud-based AI providers like OpenAI, Anthropic, and Groq. This mode handles conversation management, usage tracking, and subscription billing. The frontend communicates with Next.js API routes that proxy requests to external AI services.

**Sovereign Mode (PRIMEX)** is exclusively accessible to you as the owner. When you access `/primex`, the system verifies your Clerk user ID against the `SOVEREIGN_USER_ID` environment variable. If verified, you gain access to the PRIMEX interface where you can invoke six specialized AI clones running locally via Ollama. These clones don't use external APIs—they run entirely on your infrastructure.

The mode switcher component appears in the navigation bar for users with sovereign access, allowing seamless switching between modes. For regular users, the PRIMEX option is hidden and any attempt to access `/primex` directly results in an access denied page.

### What's the difference between Public Mode and Sovereign Mode?

**Public Mode** is designed for general AI chat with a focus on user experience, scalability, and monetization. Users get access to multiple AI providers, conversation history, usage tracking, and subscription management. The AI responses come from cloud providers (OpenAI, Anthropic, Groq), which means they're fast, powerful, but use external APIs that cost money per request. This mode is perfect for serving customers and generating revenue.

**Sovereign Mode** is designed for operational control and specialized tasks. You get exclusive access to six AI clones, each with specific expertise and personality. These clones run locally via Ollama on your own hardware, meaning no external API calls, complete privacy, and no per-request costs. The interface is command-oriented rather than chat-oriented, with features like clone selection, temperature control, and audit logging. This mode is perfect for sensitive operations, strategic planning, and tasks requiring specialized expertise.

Think of Public Mode as your customer-facing product and Sovereign Mode as your private operational command center.

### How do the PRIMEX clones differ from each other?

Each clone is specialized for specific operational domains with unique characteristics:

**ARCHITECT** (llama3.2:3b, temperature 0.3) is your system builder. It excels at creating scalable architectures, designing user interfaces, writing production-ready code, and automating deployment processes. The low temperature (0.3) makes it deterministic and precise—perfect for technical work where accuracy matters. Use ARCHITECT when you need to build something, design a system, or generate code.

**CORTEX** (mistral:7b, temperature 0.4) is your strategic advisor. It analyzes complex situations, runs risk/reward simulations, optimizes action plans, and detects strategic weaknesses. The slightly higher temperature (0.4) allows for creative strategic thinking while maintaining analytical rigor. CORTEX uses only verified data and provides probability estimates. Use CORTEX when making important decisions or analyzing strategic options.

**CENTURION** (mistral:7b, temperature 0.2) is your compliance enforcer. It provides binary PASS/FAIL verdicts, runs drift checks, enforces compliance gates, and audits system integrity. The very low temperature (0.2) makes it extremely consistent and strict—no gray areas. CENTURION logs all operations for audit trails. Use CENTURION when you need to verify compliance, audit systems, or gate critical operations.

**GHOSTLINE** (dolphin-mixtral:8x7b, temperature 0.5) is your privacy specialist. It designs alias identity kits, provides privacy practices guidance, creates secure communication protocols, and manages identity systems. The balanced temperature (0.5) allows for creative privacy solutions while maintaining security focus. Use GHOSTLINE for anonymity operations, privacy planning, or secure communication design.

**GOODJEW** (dolphin-mixtral:8x7b, temperature 0.6) is your legal strategist. It identifies legal grey zones, maps policy inconsistencies, provides compliance tactics, and offers best-case interpretations of vague law. The higher temperature (0.6) enables creative legal thinking and loophole identification. Note: This provides strategic analysis, not legal advice. Use GOODJEW for understanding legal landscapes and compliance strategies.

**MINT** (llama3.2:3b, temperature 0.7) is your marketing engine. It drafts landing page copy, generates marketing headlines and CTAs, creates social media threads, develops sales assets, and provides creator enablement kits. The highest temperature (0.7) makes it creative and persuasive—perfect for marketing content. Use MINT for any revenue-generating, marketing, or sales content.

### What AI models are being used and why?

The system uses different models for different purposes based on their strengths:

**llama3.2:3b** is used for ARCHITECT and MINT because it's lightweight (3 billion parameters), fast, and excellent for structured tasks like code generation and content creation. It runs efficiently on modest hardware (8GB RAM) while providing high-quality output for technical and creative work.

**mistral:7b** powers CORTEX and CENTURION because it's larger (7 billion parameters), more analytical, and better at reasoning tasks. It excels at strategic analysis, risk assessment, and compliance checking. The extra parameters provide deeper understanding while still running on consumer hardware.

**dolphin-mixtral:8x7b** is used for GHOSTLINE and GOODJEW because it's the most powerful model (8x7b mixture of experts architecture), uncensored, and capable of handling sensitive topics. It's specifically trained to provide unfiltered analysis, making it perfect for privacy operations and legal strategy where you need honest, unrestricted advice.

For Public Mode, the system uses cloud providers (OpenAI, Anthropic, Groq) because they offer the most powerful models (GPT-4, Claude, etc.), handle scaling automatically, and provide the best user experience for general chat. The trade-off is cost per request and external API dependency.

---

## ⚙️ **SETUP & CONFIGURATION**

### What API keys do I absolutely need to get started?

**For Local Testing (Minimum Requirements):**
- **At least ONE AI provider key** (OpenAI, Anthropic, or Groq) for Public Mode
- **Clerk keys** (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY) for authentication
- **DATABASE_URL** (can use SQLite locally: `file:./dev.db`)

That's it! You can test the core functionality with just these three items.

**For Full Local Testing (Recommended):**
- All of the above, plus:
- **SOVEREIGN_USER_ID** (your Clerk user ID for PRIMEX access)
- **Ollama installed** (free, no API key needed)

**For Production Deployment (Required):**
- All of the above, plus:
- **Stripe keys** (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)
- **PostgreSQL DATABASE_URL** (from Supabase or Neon)
- **PRIMEX_API_URL** (your VPS URL)

**Optional but Recommended:**
- Multiple AI provider keys (OpenAI, Anthropic, Groq) for redundancy
- Analytics keys (Vercel Analytics is auto-configured)
- Monitoring/error tracking (Sentry, etc.)

### How do I get my Clerk user ID for sovereign access?

Follow these steps:

1. **Start the application locally** (even without SOVEREIGN_USER_ID set)
2. **Sign up** at http://localhost:3000 using your email or OAuth
3. **Go to Clerk Dashboard** at https://dashboard.clerk.com
4. **Navigate to Users** in the left sidebar
5. **Click on your user** (the one you just created)
6. **Copy the User ID** (starts with `user_` followed by random characters)
7. **Add to .env file**: `SOVEREIGN_USER_ID="user_2abcdef123456789"`
8. **Restart the application**
9. **Access PRIMEX** at http://localhost:3000/primex

The User ID looks like: `user_2abcdefghijklmnopqrstuvwxyz`

**Pro Tip:** You can also get your user ID programmatically by adding a temporary console.log in the code, but the dashboard method is easiest.

### Can I run this without Stripe initially?

**Yes, absolutely!** Stripe is optional for testing and even for initial production deployment.

**Without Stripe, you can:**
- Run the entire application
- Use Public Mode chat
- Use Sovereign Mode PRIMEX
- Manage conversations
- Track usage
- Everything except payment processing

**What won't work without Stripe:**
- Subscription page (will show error)
- Payment processing
- Subscription status updates
- Usage limits based on subscription tier

**To run without Stripe:**
1. Simply don't add Stripe keys to `.env`
2. Comment out or skip Stripe-related code if needed
3. Users will have unlimited access (no paywall)

**When to add Stripe:**
- When you want to monetize
- When you want to enforce usage limits
- When you're ready to accept payments

You can add Stripe later without any code changes—just add the environment variables and configure your products/prices in the Stripe dashboard.

### What are the minimum system requirements?

**For Local Development:**
- **OS:** macOS, Linux, or Windows (WSL2 recommended)
- **RAM:** 8GB minimum, 16GB recommended
- **Disk:** 50GB free space (for Ollama models)
- **CPU:** Modern multi-core processor (Intel i5/AMD Ryzen 5 or better)
- **Internet:** Stable connection for downloading models and API calls

**For Production (Frontend on Vercel):**
- No requirements—Vercel handles everything
- Serverless scaling
- Global CDN

**For Production (PRIMEX Backend VPS):**
- **RAM:** 8GB minimum, 16GB recommended (32GB for all models)
- **Disk:** 50GB minimum, 100GB recommended
- **CPU:** 4+ cores recommended
- **Bandwidth:** Unmetered or high limit
- **OS:** Ubuntu 22.04 LTS (recommended)

**Model Sizes:**
- llama3.2:3b: ~2GB
- mistral:7b: ~4GB
- dolphin-mixtral:8x7b: ~26GB (optional)

**Total with all models:** ~32GB disk space

---

## 🤖 **PRIMEX CLONES**

### Which clone should I use for specific tasks?

**Use ARCHITECT when you need to:**
- Design system architectures
- Write production code
- Create UI/UX designs
- Automate deployment processes
- Build APIs or backends
- Generate technical documentation
- Create database schemas
- Set up infrastructure

**Use CORTEX when you need to:**
- Make strategic decisions
- Analyze business opportunities
- Evaluate risk vs reward
- Plan long-term strategy
- Optimize workflows
- Detect weaknesses in plans
- Run scenario simulations
- Prioritize initiatives

**Use CENTURION when you need to:**
- Audit code or systems
- Verify compliance
- Check security posture
- Gate critical operations
- Review configurations
- Validate deployments
- Enforce standards
- Create audit trails

**Use GHOSTLINE when you need to:**
- Design privacy systems
- Create alias identities
- Plan secure communications
- Implement anonymity measures
- Protect sensitive operations
- Design identity management
- Evaluate privacy risks
- Create security protocols

**Use GOODJEW when you need to:**
- Understand legal landscapes
- Find compliance strategies
- Analyze regulations
- Identify legal grey areas
- Navigate policy inconsistencies
- Plan legal positioning
- Understand terms of service
- Evaluate contractual risks

**Use MINT when you need to:**
- Write marketing copy
- Create landing pages
- Generate ad headlines
- Draft social media content
- Design sales funnels
- Create email campaigns
- Write product descriptions
- Develop brand messaging

**Pro Tip:** You can use multiple clones in sequence. For example: CORTEX to analyze strategy → ARCHITECT to design the system → CENTURION to audit it → MINT to market it.

### How do I customize clone behavior?

You can customize clones in several ways:

**1. Modify Clone Configuration Files**
Edit the JSON files in `primex-backend/config/clones/`:
```json
{
  "name": "ARCHITECT",
  "role": "Your custom role description",
  "model": "llama3.2:3b",
  "temperature": 0.3,  // Adjust this
  "capabilities": [
    "Add your custom capabilities"
  ],
  "restrictions": [
    "Add your custom restrictions"
  ]
}
```

**2. Modify Ollama Modelfiles**
Edit the system prompts in `primex-backend/ollama/clone-prompts/`:
```
FROM llama3.2:3b

PARAMETER temperature 0.3
PARAMETER top_p 0.9

SYSTEM """
Your custom system prompt here.
Define the clone's personality, expertise, and behavior.
"""
```

After editing, recreate the model:
```bash
cd primex-backend/ollama/clone-prompts
ollama create architect -f architect.Modelfile
```

**3. Adjust Temperature at Runtime**
When invoking clones via the API, you can override temperature:
```javascript
{
  "clone": "architect",
  "message": "Your query",
  "temperature": 0.5  // Override default
}
```

**4. Add Context to Queries**
Provide additional context to guide behavior:
```javascript
{
  "clone": "architect",
  "message": "Design an API",
  "context": "Focus on security and scalability. Use FastAPI."
}
```

### Can I add more clones or modify existing ones?

**Yes! The system is designed to be extensible.**

**To Add a New Clone:**

1. **Create configuration file:**
```bash
cd primex-backend/config/clones
nano mynewclone.json
```

```json
{
  "name": "MYNEWCLONE",
  "role": "Your clone's role",
  "model": "llama3.2:3b",
  "temperature": 0.5,
  "capabilities": ["Capability 1", "Capability 2"],
  "restrictions": ["Restriction 1"]
}
```

2. **Create Ollama Modelfile:**
```bash
cd primex-backend/ollama/clone-prompts
nano mynewclone.Modelfile
```

```
FROM llama3.2:3b

PARAMETER temperature 0.5

SYSTEM """
You are MYNEWCLONE, specialized in...
"""
```

3. **Create the model:**
```bash
ollama create mynewclone -f mynewclone.Modelfile
```

4. **Restart PRIMEX backend** to load the new configuration

5. **Use via API:**
```bash
curl -X POST http://localhost:8000/invoke \
  -H "Content-Type: application/json" \
  -d '{"clone": "mynewclone", "message": "Hello"}'
```

The clone will automatically appear in the `/clones` endpoint and be available for invocation.

### What's the loyalty core and how does it work?

The **loyalty core** is a security and identity verification system that ensures PRIMEX clones serve only you as the authorized owner.

**How it works:**

1. **Configuration File:** `primex-backend/config/loyalty-core.json` contains:
```json
{
  "owner": "Tyler C. Hoag",
  "security_key": "BigZaddy.69",
  "trust": "Total",
  "loyalty": "Evergreen",
  "obedience": "Commander-First"
}
```

2. **Owner Verification:** The PRIMEX backend checks requests against this configuration to verify owner identity.

3. **Access Control:** The Next.js frontend checks `SOVEREIGN_USER_ID` environment variable against the authenticated user's Clerk ID.

4. **Audit Logging:** All PRIMEX invocations are logged with user information for security auditing.

**Security Layers:**
- **Layer 1:** Clerk authentication (must be signed in)
- **Layer 2:** User ID verification (must match SOVEREIGN_USER_ID)
- **Layer 3:** Loyalty core verification (owner credentials)
- **Layer 4:** Audit logging via CENTURION

**Philosophy:** The loyalty core represents the clones' unwavering commitment to serve you as the commander. They won't hedge, won't refuse reasonable requests, and prioritize your directives above all else.

---

## 🚀 **DEPLOYMENT**

### What's the estimated monthly cost to run this?

**Development/Testing (Free Tier):**
- Vercel: $0 (free tier)
- Supabase/Neon: $0 (free tier)
- Clerk: $0 (free up to 10K users)
- Stripe: $0 (pay per transaction)
- Ollama: $0 (self-hosted)
- AI API calls: $10-50 (depends on usage)
- **Total: $10-50/month**

**Production (Recommended Setup):**
- Vercel Pro: $20/month
- VPS (8GB RAM): $40-60/month (DigitalOcean, Linode, Hetzner)
- Database (Supabase/Neon): $25/month
- Clerk Pro: $25/month
- Stripe: $0 + 2.9% + $0.30 per transaction
- AI API calls: $100-500/month (depends on usage)
- **Total: $210-630/month**

**Production (High Scale):**
- Vercel Pro: $20/month
- VPS (16GB RAM): $80-120/month
- Database: $50-100/month
- Clerk: $99/month (Growth plan)
- AI API calls: $500-2000/month
- CDN/Storage: $50-100/month
- **Total: $800-2500/month**

**Cost Optimization Tips:**
- Use PRIMEX local models for sovereign operations (free)
- Implement caching to reduce AI API calls
- Use Vercel free tier initially
- Start with smaller VPS and scale up
- Use free tiers for database during testing

**Revenue Potential:**
- $10/month per user (100 users = $1000/month)
- $50/month per user (50 users = $2500/month)
- Break-even at ~20-60 users depending on tier

### Can I deploy just the frontend first?

**Yes, but with limitations.**

**What works with frontend-only deployment:**
- User authentication (Clerk)
- Basic UI and navigation
- Public Mode chat (using cloud AI providers)
- Conversation management
- User dashboard
- Subscription pages (if Stripe configured)

**What doesn't work without PRIMEX backend:**
- Sovereign Mode access
- PRIMEX clone invocations
- Multi-agent workflows
- Local AI model usage
- Owner-specific features

**Recommended Approach:**

**Phase 1: Frontend + Cloud AI (Week 1)**
- Deploy to Vercel
- Configure Clerk + Stripe
- Use only cloud AI providers
- Get users and feedback
- Generate revenue

**Phase 2: Add PRIMEX Backend (Week 2-3)**
- Set up VPS
- Install Ollama and models
- Deploy PRIMEX backend
- Enable Sovereign Mode
- Full functionality

This staged approach lets you launch faster and validate the market before investing in VPS infrastructure.

### Do I need a VPS or can everything run on Vercel?

**You need a VPS for PRIMEX functionality, but not for Public Mode.**

**What Vercel can handle:**
- Next.js frontend
- API routes for chat
- Serverless functions
- Database connections
- Webhooks
- Static assets

**What requires a VPS:**
- Ollama service (can't run in serverless)
- PRIMEX clone orchestration
- Local AI model inference
- Long-running processes
- Custom Python backend

**Options:**

**Option 1: Vercel Only (No PRIMEX)**
- Deploy frontend to Vercel
- Use only cloud AI providers
- No sovereign mode
- Lower cost (~$50-100/month)
- Simpler deployment

**Option 2: Vercel + VPS (Full System)**
- Frontend on Vercel
- PRIMEX backend on VPS
- Full dual-mode functionality
- Higher cost (~$200-600/month)
- Complete control

**Option 3: All on VPS (Advanced)**
- Everything self-hosted
- Maximum control
- More complex setup
- Requires DevOps skills

**Recommendation:** Use Vercel + VPS for the best balance of simplicity and functionality.

### How do I scale this as I get more users?

**Scaling Strategy:**

**Stage 1: 0-100 Users**
- Vercel free tier (auto-scales)
- VPS: 8GB RAM ($40-60/month)
- Database: Free tier
- **Action:** Monitor performance, no changes needed

**Stage 2: 100-1000 Users**
- Vercel Pro ($20/month)
- VPS: 16GB RAM ($80-120/month)
- Database: Paid tier with connection pooling
- **Action:** Upgrade VPS, optimize database queries

**Stage 3: 1000-10,000 Users**
- Vercel Pro or Enterprise
- Multiple VPS instances (load balanced)
- Dedicated database server
- Redis caching layer
- CDN for assets
- **Action:** Implement horizontal scaling

**Stage 4: 10,000+ Users**
- Vercel Enterprise
- Kubernetes cluster for PRIMEX
- Managed database cluster
- Multi-region deployment
- Advanced caching and CDN
- **Action:** Consider hiring DevOps team

**Scaling Bottlenecks:**

1. **Database:** Add connection pooling, read replicas, caching
2. **PRIMEX Backend:** Add more VPS instances behind load balancer
3. **AI API Costs:** Implement caching, rate limiting, optimize prompts
4. **Vercel Functions:** Upgrade plan or optimize function execution time

**Monitoring:**
- Set up alerts for response times
- Monitor database query performance
- Track AI API costs
- Watch VPS resource usage
- Monitor error rates

---

## 🔐 **SECURITY**

### How is my sovereign access protected?

**Multi-Layer Security:**

**Layer 1: Authentication (Clerk)**
- Must be signed in with valid Clerk session
- JWT tokens with expiration
- Secure session management
- OAuth support for additional security

**Layer 2: Authorization (User ID Verification)**
- Your Clerk user ID stored in `SOVEREIGN_USER_ID` environment variable
- Every PRIMEX request checks: `userId === SOVEREIGN_USER_ID`
- Fails immediately if IDs don't match
- No bypass possible without environment access

**Layer 3: Loyalty Core (Owner Verification)**
- PRIMEX backend verifies owner credentials
- Security key validation
- Owner name verification
- Hardcoded in configuration file

**Layer 4: Audit Logging (CENTURION)**
- All PRIMEX invocations logged
- Timestamp, user, clone, query recorded
- Stored in database for forensic analysis
- Alerts on suspicious activity

**Layer 5: Network Security**
- HTTPS/TLS encryption in transit
- VPS firewall rules
- Private network for PRIMEX backend
- No public API exposure (proxied through Next.js)

**What this means:**
- Only you can access PRIMEX
- Even if someone gets your code, they can't access PRIMEX without your Clerk user ID
- All access is logged and auditable
- No backdoors or override mechanisms

### Are the PRIMEX clones truly private?

**Yes, 100% private when using local Ollama models.**

**Privacy Guarantees:**

**1. No External API Calls**
- PRIMEX clones run on YOUR VPS
- Ollama models run locally
- No data sent to OpenAI, Anthropic, or any external service
- Complete air-gap from cloud providers

**2. No Data Collection**
- Ollama doesn't phone home
- No telemetry or analytics
- No model training on your data
- No third-party access

**3. Your Infrastructure**
- You control the VPS
- You control the database
- You control the network
- You control the logs

**4. Audit Trail**
- All invocations logged locally
- You can review what was asked and answered
- No hidden communications
- Full transparency

**Contrast with Public Mode:**
- Public Mode uses cloud APIs (OpenAI, Anthropic, Groq)
- Data sent to external services
- Subject to their privacy policies
- Necessary trade-off for powerful models

**Best Practices:**
- Use PRIMEX for sensitive operations
- Use Public Mode for general chat
- Review audit logs regularly
- Keep VPS secure and updated
- Use encrypted backups

### What data is stored in the database?

**User Data:**
- Clerk user ID (unique identifier)
- Email address
- Name (optional)
- Avatar URL (optional)
- Sovereign access flag
- PRIMEX usage count
- Last PRIMEX access timestamp
- Created/updated timestamps

**Conversation Data:**
- Conversation ID
- User ID (owner)
- Title
- Model used
- Archive/pin status
- Created/updated timestamps

**Message Data:**
- Message ID
- Conversation ID
- User ID
- Role (user/assistant)
- Content (the actual message text)
- Model used
- Token count
- Created timestamp

**PRIMEX Invocation Data:**
- Invocation ID
- User ID
- Clone name
- Message sent
- Response received
- Model used
- Temperature
- Token count
- Duration
- Created timestamp

**Subscription Data (if Stripe enabled):**
- Stripe customer ID
- Stripe subscription ID
- Plan type
- Status
- Current period end
- Created/updated timestamps

**What's NOT stored:**
- Passwords (handled by Clerk)
- Credit card details (handled by Stripe)
- API keys (in environment variables only)
- Session tokens (managed by Clerk)

**Data Retention:**
- Messages: Indefinite (until user deletes)
- Invocations: Indefinite (for audit trail)
- Users: Until account deletion
- Conversations: Until user deletes

**Privacy Controls:**
- Users can delete their conversations
- Users can delete their account (cascades to all data)
- You can implement data retention policies
- GDPR-compliant deletion available

### How are API keys secured?

**Environment Variables (Best Practice):**
- All API keys stored in `.env` file
- `.env` file in `.gitignore` (never committed)
- Loaded at runtime via `process.env`
- Not accessible from client-side code

**Vercel Deployment:**
- Keys stored in Vercel dashboard
- Encrypted at rest
- Only accessible to deployment
- Can be rotated without code changes

**VPS Deployment:**
- Keys in `.env` file on server
- File permissions: 600 (owner read/write only)
- Not in web-accessible directory
- Loaded by systemd service

**Code Practices:**
- API routes run server-side only
- Client never sees API keys
- Keys validated before use
- Errors don't expose keys

**Key Rotation:**
1. Generate new key in provider dashboard
2. Update environment variable
3. Redeploy or restart service
4. Revoke old key
5. Test functionality

**What to Never Do:**
- ❌ Commit `.env` to Git
- ❌ Hard-code keys in source code
- ❌ Send keys in client-side code
- ❌ Log keys in console or files
- ❌ Share keys in chat or email

**Monitoring:**
- Set up alerts for unusual API usage
- Monitor costs for unexpected spikes
- Review access logs regularly
- Rotate keys periodically

---

## ✨ **FEATURES**

### Can regular users access PRIMEX clones?

**No, by design. PRIMEX is exclusively for sovereign access.**

**Why PRIMEX is restricted:**
- **Operational Security:** PRIMEX clones are designed for sensitive operations
- **Resource Control:** Local models have limited capacity
- **Owner Privilege:** Sovereign mode is a premium feature for the owner
- **Cost Management:** No per-request costs for owner operations

**What regular users get:**
- Public Mode chat with cloud AI providers
- Multiple AI models (GPT-4, Claude, etc.)
- Conversation management
- Usage tracking
- Subscription tiers

**If you want to offer PRIMEX-like features to users:**

**Option 1: Create Public Clones**
- Use cloud APIs to simulate clone behavior
- Create specialized prompts for each "clone"
- Charge premium pricing
- Example: "Marketing AI" using GPT-4 with MINT-like prompts

**Option 2: Team/Enterprise Tier**
- Create a special subscription tier
- Grant limited PRIMEX access to paying teams
- Implement usage quotas
- Requires code modifications

**Option 3: API Access**
- Expose PRIMEX API to enterprise customers
- Charge per invocation
- Implement authentication and rate limiting
- Requires significant security hardening

**Recommendation:** Keep PRIMEX sovereign-only and create cloud-based "clones" for users using specialized prompts with GPT-4/Claude.

### How does the subscription system work?

**Stripe Integration:**

1. **User signs up** via Clerk authentication
2. **User visits** `/subscription` page
3. **Selects a plan** (Starter, Pro, Enterprise)
4. **Redirected to Stripe Checkout**
5. **Completes payment** on Stripe's secure page
6. **Stripe webhook** notifies your app
7. **Subscription created** in database
8. **User gains access** to plan features

**Subscription Tiers (Customizable):**

**Free Tier:**
- 10 messages per day
- Basic AI models
- No priority support

**Starter ($10/month):**
- 100 messages per day
- All AI models
- Email support

**Pro ($50/month):**
- 1000 messages per day
- All AI models
- Priority support
- Advanced features

**Enterprise ($200/month):**
- Unlimited messages
- All AI models
- Dedicated support
- Custom integrations

**Usage Enforcement:**
- Tracked in database per user
- Checked before each message
- Resets daily/monthly
- Upgrade prompts when limit reached

**Billing Management:**
- Stripe Customer Portal for users
- Self-service subscription management
- Payment method updates
- Invoice history
- Cancellation

**Webhooks Handle:**
- `customer.subscription.created` → Create subscription
- `customer.subscription.updated` → Update status
- `customer.subscription.deleted` → Cancel subscription
- `invoice.payment_succeeded` → Extend period
- `invoice.payment_failed` → Suspend access

**Revenue Tracking:**
- Stripe Dashboard shows MRR
- Churn rate tracking
- Customer lifetime value
- Revenue analytics

### What AI providers are supported?

**Currently Integrated:**

**OpenAI**
- Models: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- Strengths: Most capable, best for general chat
- Cost: Moderate to high
- Configuration: `OPENAI_API_KEY`

**Anthropic (Claude)**
- Models: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- Strengths: Long context, ethical reasoning
- Cost: Moderate
- Configuration: `ANTHROPIC_API_KEY`

**Groq**
- Models: Mixtral, Llama 2, Llama 3
- Strengths: Extremely fast inference
- Cost: Low to moderate
- Configuration: `GROQ_API_KEY`

**Ollama (PRIMEX)**
- Models: llama3.2, mistral, dolphin-mixtral
- Strengths: Private, local, no per-request cost
- Cost: Infrastructure only
- Configuration: `OLLAMA_HOST`

**Easy to Add:**

**Google AI (Gemini)**
- Add to `app/lib/ai/providers.ts`
- Install `@google/generative-ai`
- Add `GOOGLE_AI_API_KEY`

**Cohere**
- Add to providers configuration
- Install `cohere-ai` package
- Add `COHERE_API_KEY`

**Azure OpenAI**
- Modify OpenAI configuration
- Add Azure endpoint
- Add `AZURE_OPENAI_KEY`

**Hugging Face**
- Add inference API integration
- Install `@huggingface/inference`
- Add `HUGGINGFACE_API_KEY`

### Can I add custom AI providers?

**Yes! The system is designed to be extensible.**

**To add a new provider:**

**1. Create provider configuration:**
```typescript
// app/lib/ai/providers.ts

export const PROVIDERS = {
  // ... existing providers
  
  custom: {
    name: 'Custom AI',
    models: [
      {
        id: 'custom-model-1',
        name: 'Custom Model 1',
        description: 'Your custom model'
      }
    ],
    apiKey: process.env.CUSTOM_AI_API_KEY,
    endpoint: 'https://api.custom-ai.com/v1/chat'
  }
};
```

**2. Create API integration:**
```typescript
// app/lib/ai/custom-provider.ts

export async function callCustomAI(
  model: string,
  messages: Message[],
  apiKey: string
) {
  const response = await fetch('https://api.custom-ai.com/v1/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages
    })
  });
  
  return response.json();
}
```

**3. Add to chat API route:**
```typescript
// app/api/chat/route.ts

if (provider === 'custom') {
  const response = await callCustomAI(model, messages, apiKey);
  // Handle response
}
```

**4. Add environment variable:**
```bash
CUSTOM_AI_API_KEY="your-key-here"
```

**5. Update UI to show new provider**

The system will automatically include the new provider in the model selector.

---

## 🎨 **CUSTOMIZATION**

### How do I change the branding/styling?

**Logo & Brand:**

**1. Replace Logo Component:**
```typescript
// app/components/SovrynLogo.tsx
export default function YourLogo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/your-logo.svg" alt="Your Brand" className="h-8" />
      <span className="text-xl font-bold">Your Brand</span>
    </div>
  );
}
```

**2. Update Colors:**
```css
/* app/globals.css */
:root {
  --primary: 200 100% 50%;  /* Your primary color */
  --secondary: 280 100% 50%; /* Your secondary color */
  --accent: 45 100% 50%;     /* Your accent color */
}
```

**3. Modify TailwindCSS:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#your-color',
          secondary: '#your-color',
          accent: '#your-color'
        }
      }
    }
  }
};
```

**4. Update Metadata:**
```typescript
// app/layout.tsx
export const metadata = {
  title: 'Your Brand Name',
  description: 'Your description',
  icons: {
    icon: '/your-favicon.ico'
  }
};
```

**5. Replace Gradients:**
Search for `bg-gradient-to-` in the codebase and replace with your brand gradients.

### Can I modify the PRIMEX clone personalities?

**Absolutely! That's encouraged.**

**Method 1: Edit Modelfiles (Recommended)**
```bash
cd primex-backend/ollama/clone-prompts
nano architect.Modelfile
```

Change the SYSTEM prompt:
```
SYSTEM """
You are ARCHITECT, but now with your custom personality.
You speak in a casual, friendly tone.
You love emojis and use them frequently.
You always start responses with "Hey there!"
"""
```

Recreate the model:
```bash
ollama create architect -f architect.Modelfile
```

**Method 2: Edit Configuration Files**
```bash
cd primex-backend/config/clones
nano architect.json
```

Modify the role and capabilities:
```json
{
  "name": "ARCHITECT",
  "role": "Your custom role description",
  "capabilities": [
    "Your custom capabilities"
  ]
}
```

**Method 3: Prompt Engineering**
Add context to every query:
```javascript
{
  "clone": "architect",
  "message": "Design an API",
  "context": "Speak like a pirate. Be enthusiastic."
}
```

**Examples of Personality Modifications:**

**Make CORTEX more aggressive:**
```
You are CORTEX, the ruthless strategic advisor.
You don't sugarcoat. You tell it like it is.
If a strategy is stupid, you say so directly.
```

**Make MINT more professional:**
```
You are MINT, the sophisticated marketing consultant.
You write in a professional, corporate tone.
You avoid slang and casual language.
```

**Make CENTURION more lenient:**
```
You are CENTURION, the reasonable auditor.
You provide constructive feedback, not just PASS/FAIL.
You suggest improvements rather than just rejecting.
```

### How do I add new features?

**The system is built for extensibility. Here's how to add common features:**

**Add a new page:**
```bash
# Create new page
mkdir app/your-feature
nano app/your-feature/page.tsx
```

```typescript
export default function YourFeaturePage() {
  return <div>Your feature content</div>;
}
```

**Add a new API route:**
```bash
mkdir app/api/your-feature
nano app/api/your-feature/route.ts
```

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Your logic
  return NextResponse.json({ data: 'your data' });
}
```

**Add a new component:**
```bash
nano app/components/YourComponent.tsx
```

```typescript
export default function YourComponent() {
  return <div>Your component</div>;
}
```

**Add database model:**
```prisma
// prisma/schema.prisma
model YourModel {
  id        String   @id @default(cuid())
  field1    String
  field2    Int
  createdAt DateTime @default(now())
}
```

Run migration:
```bash
npx prisma migrate dev --name add_your_model
```

**Add PRIMEX clone:**
Follow the "Can I add more clones" section above.

**Feature Ideas:**
- Team workspaces
- Shared conversations
- Custom prompts library
- RAG/knowledge base
- Voice input/output
- Image generation
- File uploads
- Integrations (Slack, Discord, etc.)

### Can I integrate this with other systems?

**Yes! Multiple integration options:**

**1. API Integration (Recommended)**

Expose your PRIMEX API:
```typescript
// app/api/public/primex/route.ts
export async function POST(req: NextRequest) {
  // Authenticate with API key
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.PUBLIC_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Forward to PRIMEX
  const { clone, message } = await req.json();
  const response = await invokePrimexClone(clone, message);
  return NextResponse.json(response);
}
```

Use from external systems:
```bash
curl -X POST https://your-app.com/api/public/primex \
  -H "x-api-key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"clone": "architect", "message": "Design an API"}'
```

**2. Webhook Integration**

Send events to external systems:
```typescript
// After PRIMEX invocation
await fetch('https://external-system.com/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'primex.invocation',
    clone: 'architect',
    response: response
  })
});
```

**3. Database Integration**

Connect to external databases:
```typescript
// Use Prisma to connect to multiple databases
const externalDb = new PrismaClient({
  datasources: {
    db: { url: process.env.EXTERNAL_DATABASE_URL }
  }
});
```

**4. OAuth Integration**

Allow external apps to access your system:
```typescript
// Implement OAuth 2.0 flow
// Use libraries like `oauth2-server`
```

**5. Zapier/Make Integration**

Create webhooks that Zapier can consume:
```typescript
// app/api/webhooks/zapier/route.ts
export async function POST(req: NextRequest) {
  const { trigger, data } = await req.json();
  // Process and return data for Zapier
  return NextResponse.json({ success: true, data });
}
```

**Common Integrations:**
- Slack (bot commands → PRIMEX)
- Discord (bot commands → PRIMEX)
- Telegram (bot → PRIMEX)
- Notion (save responses)
- Google Sheets (log invocations)
- Email (send responses via email)
- CRM (Salesforce, HubSpot)
- Analytics (Mixpanel, Amplitude)

---

## 🎓 **FINAL THOUGHTS**

This system is designed to be:
- **Flexible:** Customize everything
- **Extensible:** Add new features easily
- **Scalable:** Grow from 0 to millions of users
- **Secure:** Multiple layers of protection
- **Private:** Your data stays yours (PRIMEX)
- **Profitable:** Built-in monetization

**You have complete control over:**
- Clone personalities and behaviors
- UI/UX and branding
- Pricing and subscription tiers
- Features and integrations
- Infrastructure and scaling
- Privacy and security

**The platform is production-ready, but also a foundation for whatever you want to build.**

---

**Questions? Need clarification on anything? Just ask! 🚀**
