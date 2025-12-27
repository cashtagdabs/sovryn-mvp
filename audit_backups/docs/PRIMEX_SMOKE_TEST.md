# PRIMEX Smoke Test & Fallback Strategy

This document covers smoke testing local PRIMEX/Ollama invocations and the automatic fallback mechanism when PRIMEX is unavailable.

---

## Overview

### System Architecture

```
┌─────────────────┐
│  Next.js Chat   │
│   Endpoint      │
└────────┬────────┘
         │
    POST /api/chat
    (modelId: 'primex-ultra')
         │
    ┌────▼────────────────────┐
    │   AIRouter.chat()        │
    │   (with fallback logic)  │
    └────┬─────────────────────┘
         │
    Try PRIMEX first
         │
    ┌────▼─────────────────┐
    │  Check Provider      │
    │  Health              │
    └────┬────────┬────────┘
         │        │
    ✓ Healthy   ✗ Unhealthy
         │        │
         │    ┌───▼──────────────────┐
         │    │ Resolve Fallback     │
         │    │ (OpenAI/Groq/Claude) │
         │    └───┬──────────────────┘
         │        │
    ┌────▼────────▼────┐
    │  Execute Chat    │
    │  (Stream or Full)│
    └─────────────────┘
         │
    ┌────▼──────────────────┐
    │  Save to Postgres      │
    │  (conversation+message)│
    └──────────────────────┘
```

### Provider Fallback Mapping

When PRIMEX/Ollama fails, models are cloned to fallback providers:

| PRIMEX Model | Fallback 1 | Fallback 2 | Fallback 3 |
|---|---|---|---|
| `primex-ultra` | `gpt-4-turbo` | `mixtral-8x7b` | `claude-3-sonnet` |
| `primex-architect` | `gpt-4` | `mixtral-8x7b` | `claude-3-haiku` |
| `primex-cortex` | `gpt-4-turbo` | `claude-3-sonnet` | `mixtral-8x7b` |

---

## Environment Setup

### Prerequisites

1. **PRIMEX Backend** (local or remote)
   ```bash
   # Option A: Local Ollama
   ollama pull llama2
   ollama serve  # Runs on http://localhost:11434
   
   # Option B: PRIMEX API container
   docker run -p 8000:8000 primex-api:latest
   ```

2. **Environment Variables**
   ```env
   # .env.local
   PRIMEX_BACKEND_URL=http://localhost:8000
   OLLAMA_API_URL=http://localhost:11434
   
   # Fallback provider keys (for when PRIMEX is down)
   OPENAI_API_KEY=sk-...
   GROQ_API_KEY=gsk-...
   ANTHROPIC_API_KEY=sk-ant-...
   
   # Database
   DATABASE_URL=postgresql://...
   
   # Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   ```

---

## Smoke Test Scenarios

### Scenario 1: PRIMEX Healthy ✓

**Setup:**
```bash
# Start PRIMEX backend
PRIMEX_BACKEND_URL=http://localhost:8000 npm run dev
```

**Test Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer $(your-clerk-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "primex-ultra",
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

**Expected Result:**
```json
{
  "conversationId": "conv_...",
  "message": {
    "id": "msg_...",
    "content": "Hello! I'm PRIMEX...",
    "role": "assistant",
    "model": "primex-ultra",
    "fallback": false  // ← Indicates no fallback used
  }
}
```

**Logs to Verify:**
```
[Router] PRIMEX request succeeded
[Conversation] Saved message to DB
```

---

### Scenario 2: PRIMEX Down → Fallback to OpenAI ✓

**Setup:**
```bash
# Stop/block PRIMEX
kill $(lsof -t -i :8000)  # or just don't start it

# Start app with fallback providers
OPENAI_API_KEY=sk-... npm run dev
```

**Test Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer $(your-clerk-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "primex-ultra",
    "messages": [{"role": "user", "content": "What is Sovryn?"}]
  }'
```

**Expected Result:**
```json
{
  "conversationId": "conv_...",
  "message": {
    "id": "msg_...",
    "content": "Sovryn is a decentralized exchange...",
    "role": "assistant",
    "model": "gpt-4-turbo-preview",  // ← Fallback model
    "fallback": true  // ← Indicates fallback was used
  }
}
```

**Logs to Verify:**
```
[Router] Primary provider primex failed: PRIMEX request failed with status 500
[Fallback] primex-ultra → gpt-4-turbo-preview (openai healthy)
[Router] Fallback succeeded, returning response
```

---

### Scenario 3: All Fallbacks Exhausted ✗

**Setup:**
```bash
# No PRIMEX, no fallback API keys
unset OPENAI_API_KEY
unset GROQ_API_KEY
unset ANTHROPIC_API_KEY

npm run dev
```

**Test Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer $(your-clerk-token)" \
  -H "Content-Type: application/json" \
  -d '{"modelId": "primex-ultra", "messages": [{"role": "user", "content": "Hi"}]}'
```

**Expected Result:**
```json
{
  "error": "Internal server error",
  "details": "No healthy fallback available for primex-ultra"
}
```

**Logs to Verify:**
```
[Router] Primary provider primex failed: PRIMEX request failed with status 500
[Fallback] Skipping openai:gpt-4-turbo-preview: OPENAI_API_KEY not configured
[Fallback] Skipping groq:mixtral-8x7b-32768: GROQ_API_KEY not configured
[Fallback] Skipping anthropic:claude-3-sonnet: ANTHROPIC_API_KEY not configured
[Fallback] No healthy fallback available for primex-ultra
```

---

## Testing with Streaming

### Setup: Enable Streaming

Update `app/api/chat/route.ts` to support streaming:

```typescript
// In POST handler
if (req.headers.get('accept') === 'text/event-stream') {
  // Return server-sent events stream
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of aiRouter.chatStream({
        modelId: validatedData.modelId,
        messages: validatedData.messages,
        temperature: validatedData.temperature,
        maxTokens: validatedData.maxTokens,
        userId: user.id,
        conversationId: conversation.id,
      })) {
        controller.enqueue(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
      controller.close();
    },
  });
}
```

### Test Streaming Request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer $(your-clerk-token)" \
  -H "Accept: text/event-stream" \
  -d '{
    "modelId": "primex-ultra",
    "messages": [{"role": "user", "content": "Count from 1 to 10"}]
  }'
```

**Expected Output:**
```
data: {"content":"1"}
data: {"content":" 2"}
data: {"content":" 3"}
...
data: {"content":" 10"}
```

---

## Health Check Mechanism

### How It Works

1. **On-Demand Checks:** Providers are checked when needed (lazy evaluation)
2. **Caching:** Health status is cached for 5 minutes (configurable)
3. **Invalidation:** Cache is cleared when a provider fails

### Health Check Endpoints

**PRIMEX Health:**
```bash
curl http://localhost:8000/health
# Response: 200 OK or connection timeout
```

**OpenAI Health:** Checked via API key configuration
```bash
# If OPENAI_API_KEY exists → provider is healthy
```

**Groq Health:**
```bash
# If GROQ_API_KEY exists → provider is healthy
```

**Anthropic Health:**
```bash
# If ANTHROPIC_API_KEY exists → provider is healthy
```

### Debug Health Status

Add debugging to `app/lib/ai/fallback.ts`:

```typescript
// In resolveFallbackModel
console.log(`Checking fallbacks for ${modelId}:`);
for (const fallbackId of fallbacks) {
  const [provider] = fallbackId.split(':');
  const health = await healthManager.checkProviderHealth(provider);
  console.log(`  ${fallbackId}: ${health.healthy ? '✓' : '✗'} (${health.error || 'ok'})`);
}
```

---

## Clone Mapping Configuration

### Current Mapping (in `fallback.ts`)

```typescript
const MODEL_FALLBACK_MAP: ProviderFallbackMap = {
  'primex-ultra': ['openai:gpt-4-turbo-preview', 'groq:mixtral-8x7b-32768', 'anthropic:claude-3-sonnet-20240229'],
  'primex-architect': ['openai:gpt-4', 'groq:mixtral-8x7b-32768', 'anthropic:claude-3-haiku-20240307'],
  'primex-cortex': ['openai:gpt-4-turbo-preview', 'anthropic:claude-3-sonnet-20240229', 'groq:mixtral-8x7b-32768'],
};
```

### Update Mapping at Runtime

```typescript
import { setModelFallback } from '@/app/lib/ai/fallback';

// In your admin panel or config loader:
setModelFallback('custom-model', [
  'openai:gpt-4',
  'groq:llama2-70b-4096',
]);
```

---

## Monitoring & Observability

### Key Metrics to Track

1. **Fallback Usage Rate**
   ```typescript
   // Add to router
   let fallbackUsageCount = 0;
   
   if (usedFallback) {
     fallbackUsageCount++;
     // Send to analytics: fallbackUsageCount / totalRequests
   }
   ```

2. **Provider Success Rate**
   ```typescript
   // Log per provider
   console.log(`[Metrics] primex: 95% success, openai: 99%, groq: 98%`);
   ```

3. **Response Latency**
   ```typescript
   const start = Date.now();
   const result = await aiRouter.chat(options);
   const latency = Date.now() - start;
   console.log(`[Metrics] latency: ${latency}ms, fallback: ${result.fallback}`);
   ```

### Suggested Logging Format

```
[TIMESTAMP] [LEVEL] [MODULE] [METRIC]: message

Example:
2024-12-23T03:44:00Z INFO [Router] [Fallback]: primex-ultra → gpt-4-turbo-preview
2024-12-23T03:44:02Z INFO [Router] [Latency]: 1850ms (primex) vs 950ms (openai)
```

---

## Troubleshooting

### PRIMEX Connection Timeout

**Symptom:**
```
[Router] Primary provider primex failed: PRIMEX request failed with status 500
```

**Debug Steps:**
```bash
# 1. Check PRIMEX is running
curl http://localhost:8000/health

# 2. Verify URL in env
echo $PRIMEX_BACKEND_URL

# 3. Check network
netstat -an | grep 8000

# 4. Check logs
docker logs <container-id>  # if using Docker
```

**Fix:**
```bash
# Start PRIMEX
PRIMEX_BACKEND_URL=http://localhost:8000 npm run dev

# Or use ngrok for remote PRIMEX
ngrok http 8000
export PRIMEX_BACKEND_URL=https://your-ngrok-url.ngrok-free.dev
```

### Fallback Not Triggering

**Symptom:** PRIMEX errors but fallback isn't used

**Check:**
1. Is model in `MODEL_FALLBACK_MAP`?
2. Are fallback API keys configured?
3. Are providers healthy?

```typescript
import { getFallbackChain } from '@/app/lib/ai/fallback';

const chain = getFallbackChain('primex-ultra');
console.log('Fallback chain:', chain);  // Should show fallbacks
```

### Health Check Always Fails

**Symptom:** All providers show as unhealthy

**Debug:**
```typescript
import { healthManager } from '@/app/lib/ai/fallback';

const health = await healthManager.checkProviderHealth('openai');
console.log('OpenAI health:', health);
// Output: { provider: 'openai', healthy: false, error: 'OPENAI_API_KEY not configured' }
```

**Fix:**
```bash
# Verify env vars
grep -E "OPENAI|GROQ|ANTHROPIC|PRIMEX" .env.local

# Set missing keys
echo "OPENAI_API_KEY=sk-..." >> .env.local
```

---

## Best Practices

### 1. Always Test Fallback Path

Regularly test with PRIMEX disabled to ensure fallbacks work:

```bash
# Weekly test
PRIMEX_BACKEND_URL=http://localhost:9999 npm run dev  # Invalid port
# Verify fallback succeeds
```

### 2. Monitor Fallback Usage

Track when fallbacks are used—indicates PRIMEX stability issues:

```typescript
// In router
if (usedFallback) {
  analytics.track('fallback_used', {
    originalModel: options.modelId,
    fallbackModel: actualModelId,
    provider: model.provider,
  });
}
```

### 3. Graceful Degradation

Never fail completely—always have fallbacks:

```typescript
// Ensure every PRIMEX model has fallbacks
const models = ['primex-ultra', 'primex-architect', 'primex-cortex'];
models.forEach(model => {
  if (!MODEL_FALLBACK_MAP[model]) {
    throw new Error(`No fallback defined for ${model}`);
  }
});
```

### 4. Log Fallback Decisions

Make it transparent when fallbacks are used:

```typescript
if (usedFallback) {
  console.info(`[Fallback] User ${userId} used ${fallbackModelId} instead of ${originalModelId}`);
}
```

---

## Testing Checklist

- [ ] PRIMEX healthy: request succeeds, no fallback
- [ ] PRIMEX down: request falls back to OpenAI
- [ ] OpenAI down: request falls back to Groq
- [ ] All providers down: returns error with details
- [ ] Streaming works with PRIMEX
- [ ] Streaming works with fallback provider
- [ ] Health cache expires after 5 minutes
- [ ] Messages saved to DB with correct model name
- [ ] Fallback flag set correctly in response
- [ ] Clone models map to correct fallback providers
- [ ] No API keys leaked in logs or responses
- [ ] Fallback latency acceptable (< 5 seconds)

---

## References

- `app/lib/ai/router.ts` - Main routing logic with fallback try/catch
- `app/lib/ai/fallback.ts` - Health checks and model cloning
- `app/lib/ai/providers.ts` - Provider definitions and client initialization
- `app/api/chat/route.ts` - Next.js chat endpoint
- `prisma/schema.prisma` - Database schema for conversations/messages

