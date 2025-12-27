# PRIMEX Smoke Test - Quick Start

Fast reference for testing PRIMEX with fallback.

## TL;DR

```bash
# 1. Start PRIMEX (local Ollama or remote)
PRIMEX_BACKEND_URL=http://localhost:8000 npm run dev

# 2. Test with fallback
./scripts/smoke-test.sh --verbose

# 3. Manual test
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"modelId": "primex-ultra", "messages": [{"role": "user", "content": "Hi"}]}'
```

---

## Setup

### Prerequisites

```env
# .env.local
PRIMEX_BACKEND_URL=http://localhost:8000
OLLAMA_API_URL=http://localhost:11434
OPENAI_API_KEY=sk-...          # For fallback
GROQ_API_KEY=gsk-...            # For fallback
ANTHROPIC_API_KEY=sk-ant-...    # For fallback
DATABASE_URL=postgresql://...
```

### Start PRIMEX

**Option A: Local Ollama**
```bash
ollama pull llama2
ollama serve  # http://localhost:11434
```

**Option B: PRIMEX Container**
```bash
docker run -p 8000:8000 primex-api:latest
```

**Option C: Remote (via ngrok)**
```bash
ngrok http 8000
export PRIMEX_BACKEND_URL=https://your-ngrok-url.ngrok-free.dev
```

---

## Test Scenarios

### ✅ PRIMEX Healthy

```bash
# Start PRIMEX
PRIMEX_BACKEND_URL=http://localhost:8000 npm run dev

# Test
curl -X POST http://localhost:3000/api/chat \
  -d '{"modelId": "primex-ultra", "messages": [{"role": "user", "content": "Hi"}]}'

# Expect: fallback=false in response
```

### ⚠️ PRIMEX Down → Fallback

```bash
# Stop PRIMEX
kill $(lsof -t -i :8000)

# Start app with OpenAI fallback
OPENAI_API_KEY=sk-... npm run dev

# Test (same request)
curl -X POST http://localhost:3000/api/chat \
  -d '{"modelId": "primex-ultra", "messages": [{"role": "user", "content": "Hi"}]}'

# Expect: fallback=true, model=gpt-4-turbo-preview
```

### ❌ All Down

```bash
# No PRIMEX, no API keys
unset OPENAI_API_KEY GROQ_API_KEY ANTHROPIC_API_KEY
npm run dev

# Test
curl -X POST http://localhost:3000/api/chat \
  -d '{"modelId": "primex-ultra", "messages": [{"role": "user", "content": "Hi"}]}'

# Expect: error, status 503
```

---

## Automated Testing

### Using Bash Script

```bash
# Run all tests
./scripts/smoke-test.sh --verbose

# Skip PRIMEX test (test fallback only)
./scripts/smoke-test.sh --skip-primex

# Use custom PRIMEX URL
./scripts/smoke-test.sh --primex-url=http://api.example.com:8000
```

### Using TypeScript

```bash
# Run fallback tests
npm test -- fallback.test.ts

# Run with verbose output
npm test -- fallback.test.ts --verbose
```

---

## Key Files

| File | Purpose |
|------|----------|
| `app/lib/ai/fallback.ts` | Provider health checks, model cloning |
| `app/lib/ai/router.ts` | Chat routing with fallback logic |
| `app/lib/ai/providers.ts` | Provider definitions, model mappings |
| `app/api/chat/route.ts` | Next.js chat endpoint |
| `docs/PRIMEX_SMOKE_TEST.md` | Full documentation |
| `scripts/smoke-test.sh` | Bash smoke test script |
| `app/lib/ai/__tests__/fallback.test.ts` | TypeScript unit tests |

---

## Model Fallback Chains

```
primex-ultra
  ↓ fails
  → gpt-4-turbo (OpenAI)
    ↓ fails
    → mixtral-8x7b (Groq)
      ↓ fails
      → claude-3-sonnet (Anthropic)
        ↓ fails
        → ERROR

primex-architect
  ↓ fails
  → gpt-4 (OpenAI)
    ↓ fails  
    → mixtral-8x7b (Groq)
      ↓ fails
      → claude-3-haiku (Anthropic)
        ↓ fails
        → ERROR

primex-cortex
  ↓ fails
  → gpt-4-turbo (OpenAI)
    ↓ fails
    → claude-3-sonnet (Anthropic)
      ↓ fails
      → mixtral-8x7b (Groq)
        ↓ fails
        → ERROR
```

---

## Response Format

### Success (PRIMEX)
```json
{
  "conversationId": "conv_123",
  "message": {
    "id": "msg_456",
    "content": "Hello from PRIMEX",
    "role": "assistant",
    "model": "primex-ultra",
    "fallback": false,
    "usage": {"totalTokens": 50}
  }
}
```

### Success (Fallback)
```json
{
  "conversationId": "conv_123",
  "message": {
    "id": "msg_456",
    "content": "Hello from OpenAI",
    "role": "assistant",
    "model": "gpt-4-turbo-preview",
    "fallback": true,
    "usage": {"totalTokens": 75}
  }
}
```

### Error (All Down)
```json
{
  "error": "Service temporarily unavailable",
  "details": "No healthy fallback available for primex-ultra",
  "retryable": true
}
```

---

## Logs to Watch

**PRIMEX Working:**
```
[Router] PRIMEX request succeeded
[Chat] Message saved: conv_123
```

**Fallback Triggered:**
```
[Router] Primary provider primex failed: PRIMEX request failed with status 500
[Fallback] primex-ultra → gpt-4-turbo-preview (openai healthy)
[Chat] Fallback used for user user_123: primex-ultra -> gpt-4-turbo-preview
```

**All Failed:**
```
[Router] Primary provider primex failed: ...
[Fallback] Skipping openai:gpt-4-turbo-preview: OPENAI_API_KEY not configured
[Fallback] Skipping groq:mixtral-8x7b-32768: GROQ_API_KEY not configured
[Fallback] Skipping anthropic:claude-3-sonnet: ANTHROPIC_API_KEY not configured
[Fallback] No healthy fallback available for primex-ultra
```

---

## Debugging

### Check Provider Health

```typescript
import { healthManager } from '@/app/lib/ai/fallback';

const health = await healthManager.checkProviderHealth('primex');
console.log(health);
// { provider: 'primex', healthy: true, lastChecked: Date }
```

### Check Fallback Chain

```typescript
import { getFallbackChain } from '@/app/lib/ai/fallback';

const chain = getFallbackChain('primex-ultra');
console.log(chain);
// ['openai:gpt-4-turbo-preview', 'groq:mixtral-8x7b-32768', ...]
```

### Force Fresh Health Check

```typescript
import { healthManager } from '@/app/lib/ai/fallback';

healthManager.invalidateCache(); // Clear all
healthManager.invalidateCache('primex'); // Clear one
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| PRIMEX connection timeout | Start PRIMEX: `ollama serve` or Docker container |
| Fallback not working | Check API keys in `.env.local` |
| Health check always fails | Run `echo $OPENAI_API_KEY` to verify env vars |
| Tests failing in CI/CD | Only run if at least one fallback API key is set |
| Wrong model returned | Check `MODEL_FALLBACK_MAP` in `fallback.ts` |

---

## Next Steps

1. **Read full docs:** `docs/PRIMEX_SMOKE_TEST.md`
2. **Run tests:** `npm test -- fallback.test.ts`
3. **Manual test:** `./scripts/smoke-test.sh --verbose`
4. **Monitor:** Track `fallback` flag in response + analytics
5. **Iterate:** Update model chains based on performance data

