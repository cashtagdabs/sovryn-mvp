# PRIMEX Smoke Testing & Fallback Chain Documentation

**Last Updated:** December 28, 2025

## Quick Start (5 minutes)

### 1. Setup Ollama Locally
```bash
# Install: https://ollama.ai
ollama pull llama3.2:1b
ollama serve  # Terminal 1
```

### 2. Configure Environment
```bash
# .env.local
OLLAMA_API_URL=http://localhost:11434
GROQ_API_KEY=gsk_...  # Free tier fallback
DATABASE_URL=postgresql://...
```

### 3. Test the Router
```bash
npm run dev  # Terminal 2

# Terminal 3: Test model registry
npx ts-node scripts/test-model-mapping.ts

# Test chat endpoint
npx ts-node scripts/test-chat-primex.ts
```

**Expected Output:**
```
✓ Model: gpt-oss-20b
✓ Provider: ollama
✓ Fallback Chain (2 options):
  1. groq:llama-3.3-70b-versatile
  2. groq:llama-3.1-8b-instant

✓ Response received (245ms)
Model Used: gpt-oss-20b
Fallback: NO
```

---

## System Architecture

### Model Registration (providers.ts)

```typescript
AI_PROVIDERS = [
  {
    id: 'primex',
    name: 'PRIMEX',
    models: [
      { id: 'primex-ultra', provider: 'primex', ... },
      { id: 'primex-architect', provider: 'primex', ... },
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    models: [
      { id: 'gpt-oss-20b', provider: 'ollama', ... },
      { id: 'llama3.2:1b', provider: 'ollama', ... },
    ]
  },
  // + OpenAI, Anthropic, Groq
]
```

### Clone Mapping (fallback.ts)

```typescript
MODEL_FALLBACK_MAP = {
  // PRIMEX → Groq (free) → OpenAI → Anthropic
  'primex-ultra': [
    'groq:llama-3.3-70b-versatile',  // FREE tier, fast
    'groq:llama-3.1-8b-instant',      // FREE tier, instant
    'openai:gpt-4-turbo-preview',     // $$$, reliable
    'anthropic:claude-3-sonnet-...',  // $$$, high quality
  ],
  
  // Ollama → Groq (free) → OpenAI
  'gpt-oss-20b': [
    'groq:llama-3.3-70b-versatile',
    'groq:llama-3.1-8b-instant',
  ],
}
```

### Chat Flow (router.ts)

```
[Chat API Request]
       ↓
[Get Model by ID] → primex-ultra
       ↓
[Identify Provider] → primex
       ↓
[Try Primary] → PRIMEX backend
    ↙           ↘
[Success]    [Failure]
  Return       ↓
  Response  [Invalidate Cache]
             ↓
          [Get Fallback Chain]
             ↓
          [Try Groq] ← FREE!
             ↓
          [Success]
             ↓
    [Return with fallback: true]
```

---

## Test Scripts

### 1. Model Registry Verification

**File:** `scripts/test-model-mapping.ts`

```bash
npx ts-node scripts/test-model-mapping.ts
```

**Checks:**
- ✓ All models registered in AI_PROVIDERS
- ✓ Model lookup by ID works
- ✓ Fallback chains correctly mapped
- ✓ Provider resolution accurate
- ✓ Groq prioritized before OpenAI

**Output Example:**
```
✓ Model Registry & Fallback Chain Test

1. Testing Model Registry
  ✓ PRIMEX models registered: Found 3 models
  ✓ Ollama models registered: Found 3 models

2. Testing Model Lookup by ID
  ✓ Lookup: primex-ultra: Provider: primex
  ✓ Lookup: gpt-oss-20b: Provider: ollama

3. Testing Fallback Chain Mappings
  ✓ Fallback chain: primex-ultra: 4 fallbacks
  ✓ Fallback chain: gpt-oss-20b: 2 fallbacks

6/6 tests passed (100%)
✓ All tests passed!
```

### 2. Chat Router Test

**File:** `scripts/test-chat-primex.ts`

```bash
# Test with default model (gpt-oss-20b = Ollama)
npx ts-node scripts/test-chat-primex.ts

# Test with specific model
TEST_MODEL=primex-ultra npx ts-node scripts/test-chat-primex.ts

# Test PRIMEX models
TEST_MODEL=primex-architect npx ts-node scripts/test-chat-primex.ts
```

**Tests:**
- ✓ Model resolution
- ✓ Provider identification
- ✓ Chat completion (non-streaming)
- ✓ Token usage tracking
- ✓ Fallback flag in response

**Output Example:**
```
1. Model Resolution
  ✓ Model: gpt-oss-20b
  ✓ Provider: ollama
  ✓ Context: 32768 tokens
  ✓ Max Output: 4096 tokens

2. Fallback Chain (2 options)
  1. groq:llama-3.3-70b-versatile
  2. groq:llama-3.1-8b-instant

3. Sending Chat Request
  Model: gpt-oss-20b

✓ Response received (245ms)

4. Response Details
  Model Used: gpt-oss-20b
  Fallback: NO
  Content:
    Hello from PRIMEX! How can I assist you today?

  Token Usage:
    Prompt: 24
    Completion: 12
    Total: 36

✓ Chat Test Passed
```

---

## Testing Scenarios

### Scenario 1: All Systems OK (PRIMARY PATH)

**Setup:**
```bash
ollama serve  # Ollama running on localhost:11434
npm run dev   # App running
```

**Test:**
```bash
npx ts-node scripts/test-chat-primex.ts
```

**Expected:**
- Response from Ollama
- `fallback: false`
- Content from model: "gpt-oss-20b"
- Logs: No fallback attempts

---

### Scenario 2: Primary Down → Fallback (GRACEFUL DEGRADATION)

**Setup:**
```bash
# Kill Ollama
# Keep app running
GROQ_API_KEY=gsk_... npm run dev
```

**Test:**
```bash
npx ts-node scripts/test-chat-primex.ts
```

**Expected:**
- Initial failure: Ollama timeout/refused
- Router invalidates health cache
- Router retrieves fallback chain
- Fallback #1: `groq:llama-3.3-70b-versatile` (FREE tier) ✓
- Response from Groq
- `fallback: true`
- Logs show fallback chain:
  ```
  [Router] Primary provider ollama failed for gpt-oss-20b
  [Router] Attempting fallback chain for gpt-oss-20b
  [Router] Trying fallback: groq:llama-3.3-70b-versatile
  [Router] Fallback succeeded
  ```

---

### Scenario 3: Multiple Failures → Service Unavailable

**Setup:**
```bash
# Kill Ollama
# No GROQ_API_KEY or invalid key
# No OPENAI_API_KEY
npm run dev
```

**Test:**
```bash
npx ts-node scripts/test-chat-primex.ts
```

**Expected:**
- Primary failure: Ollama down
- Fallback #1 failure: Groq key invalid
- Fallback #2 failure: OpenAI key not set
- HTTP 503 Service Unavailable
- Error response:
  ```json
  {
    "error": "Service temporarily unavailable",
    "details": "All fallback attempts failed. Primary error: ...",
    "retryable": true
  }
  ```
- Logs show all attempts:
  ```
  [Router] Primary provider ollama failed
  [Router] Fallback groq:llama-3.3-70b failed: GROQ_API_KEY not configured
  [Router] Fallback openai:gpt-4-turbo failed: OPENAI_API_KEY not configured
  [Router] All fallback attempts failed
  ```

---

## Environment Variables

### Required for Local Testing
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/sovryn

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Local Inference
OLLAMA_API_URL=http://localhost:11434
PRIMEX_BACKEND_URL=http://localhost:8000
```

### Optional Fallback Providers
```bash
# Groq (Free tier - highly recommended)
GROQ_API_KEY=gsk_...

# OpenAI (Paid - reliable fallback)
OPENAI_API_KEY=sk_...

# Anthropic (Paid - high quality)
ANTHROPIC_API_KEY=sk-ant-...
```

### Minimal Setup for Testing
```bash
# In .env.local:
DATABASE_URL=postgresql://postgres:password@localhost:5432/sovryn_dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_local_...
CLERK_SECRET_KEY=sk_test_...
GROQ_API_KEY=gsk_...  # Free tier fallback
OLLAMA_API_URL=http://localhost:11434
```

---

## Debugging

### Enable Detailed Logging

```bash
# In development:
npm run dev 2>&1 | grep -i "\[router\]\|\[ollama\]\|\[groq\]\|fallback"
```

### Common Issues

**Issue: "Ollama request timed out"**
- Solution: Ensure Ollama is running: `ollama serve`
- Check: `curl http://localhost:11434/api/chat` returns 400 (not error)

**Issue: "GROQ_API_KEY not configured"**
- Solution: Add to .env.local: `GROQ_API_KEY=gsk_...`
- Get key: https://console.groq.com/keys
- Note: Free tier has rate limits (~14,400 requests/day)

**Issue: "Model not found"**
- Solution: Check model ID in providers.ts
- Ollama models need dash conversion: `gpt-oss-20b` → `gpt-oss:20b`
- Already handled in router.ts line 340

**Issue: "Fallback chain empty"**
- Solution: Add to MODEL_FALLBACK_MAP in fallback.ts
- Priority: Groq (free) > OpenAI > Anthropic

---

## Adding Custom Fallback Mappings

**File: `app/lib/ai/fallback.ts`**

```typescript
// Example: Add fallback for custom model
const MODEL_FALLBACK_MAP: ProviderFallbackMap = {
  // ... existing mappings ...
  
  // Custom model fallback
  'my-custom-model': [
    'groq:llama-3.3-70b-versatile',    // Try free Groq first
    'openai:gpt-4-turbo-preview',       // Then paid OpenAI
    'anthropic:claude-3-sonnet-20240229', // Finally Claude
  ],
};

// Or dynamically at runtime:
import { setModelFallback } from '@/app/lib/ai/fallback';

setModelFallback('my-model', [
  'groq:llama-3.3-70b-versatile',
  'openai:gpt-4-turbo-preview',
]);
```

---

## Health Checks

### Provider Health Manager

**Caching Strategy:**
- 5-minute cache per provider
- Auto-invalidate on failure
- Async health checks

**Health Check Methods:**
```typescript
// PRIMEX: GET /health
// OpenAI: Check OPENAI_API_KEY env var
// Groq: Check GROQ_API_KEY env var
// Anthropic: Check ANTHROPIC_API_KEY env var
```

### Check Provider Health

```typescript
import { healthManager } from '@/app/lib/ai/fallback';

const health = await healthManager.checkProviderHealth('primex');
console.log(health);
// {
//   provider: 'primex',
//   healthy: true,
//   lastChecked: Date,
//   error?: undefined
// }
```

---

## Performance Characteristics

### Latency

| Provider | Latency | Notes |
|----------|---------|-------|
| Ollama (local) | 100-300ms | Depends on model size |
| PRIMEX | 150-400ms | Local backend |
| Groq | 800-1500ms | Free tier, but very fast |
| OpenAI | 1-3s | Network latency |
| Anthropic | 2-5s | Network latency |

### Cost

| Provider | Input Cost | Output Cost | Notes |
|----------|-----------|-----------|-------|
| Ollama | FREE | FREE | Local, no API cost |
| PRIMEX | FREE | FREE | Self-hosted |
| Groq | FREE | FREE | Free tier: 14.4K req/day |
| OpenAI | $0.5-30 | $1.5-60 | Per 1M tokens, model-dependent |
| Anthropic | $0.25-15 | $1.25-75 | Per 1M tokens, model-dependent |

---

## Production Deployment Checklist

- [ ] PRIMEX_BACKEND_URL set to production backend
- [ ] OLLAMA_API_URL set (or removed if not using)
- [ ] GROQ_API_KEY configured (primary fallback)
- [ ] OPENAI_API_KEY configured (secondary fallback)
- [ ] Health checks passing for all providers
- [ ] Fallback chain tested under simulated provider failure
- [ ] Error messages don't leak internal details
- [ ] Structured logging configured for production
- [ ] Monitoring/alerts set for provider failures
- [ ] Fallback responses logged for audit trail
- [ ] Rate limits respected for free tiers
- [ ] Database indexed for conversation queries

---

## References

- **Chat Router:** `app/lib/ai/router.ts`
- **Providers:** `app/lib/ai/providers.ts`
- **Fallback Logic:** `app/lib/ai/fallback.ts`
- **Chat API:** `app/api/chat/route.ts`
- **Test Scripts:** `scripts/test-*.ts`

---

## Support

For issues or questions:
1. Check logs in browser DevTools
2. Run test scripts: `npx ts-node scripts/test-*.ts`
3. Verify environment variables: `cat .env.local | grep -E '(PRIMEX|OLLAMA|GROQ)'"`
4. Test direct API calls with curl
5. Check provider status pages
