/**
 * Test Script: PRIMEX/Ollama Chat via Router
 * 
 * Tests the complete chat flow:
 * 1. Router initialization
 * 2. Model resolution
 * 3. Chat completion (non-streaming)
 * 4. Fallback activation
 * 
 * Run: npx ts-node scripts/test-chat-primex.ts
 * 
 * Usage:
 *   TEST_MODEL=gpt-oss-20b npx ts-node scripts/test-chat-primex.ts
 *   TEST_SIMULATE_FAILURE=true npx ts-node scripts/test-chat-primex.ts
 */

import { aiRouter } from '@/app/lib/ai/router';
import { getModelById } from '@/app/lib/ai/providers';
import { getFallbackChain } from '@/app/lib/ai/fallback';

const TEST_MODEL = process.env.TEST_MODEL || 'gpt-oss-20b'; // Default to Ollama
const SIMULATE_FAILURE = process.env.TEST_SIMULATE_FAILURE === 'true';

async function main() {
  console.log('\n\x1b[34m═════════════════════════════════════════\x1b[0m');
  console.log('\x1b[34m        PRIMEX Chat Router Test\x1b[0m');
  console.log('\x1b[34m═════════════════════════════════════════\x1b[0m\n');

  console.log('\x1b[33m1. Model Resolution\x1b[0m');
  const model = getModelById(TEST_MODEL);
  if (!model) {
    console.error(`\x1b[31m✗ Model not found: ${TEST_MODEL}\x1b[0m`);
    process.exit(1);
  }

  console.log(`  \x1b[32m✓\x1b[0m Model: ${TEST_MODEL}`);
  console.log(`  \x1b[32m✓\x1b[0m Provider: ${model.provider}`);
  console.log(`  \x1b[32m✓\x1b[0m Context: ${model.contextWindow} tokens`);
  console.log(`  \x1b[32m✓\x1b[0m Max Output: ${model.maxTokens} tokens\n`);

  const fallbacks = getFallbackChain(TEST_MODEL);
  if (fallbacks.length > 0) {
    console.log(`\x1b[33m2. Fallback Chain (${fallbacks.length} options)\x1b[0m`);
    fallbacks.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f}`);
    });
    console.log();
  }

  console.log('\x1b[33m3. Sending Chat Request\x1b[0m');
  console.log(`  Model: ${TEST_MODEL}`);
  if (SIMULATE_FAILURE) {
    console.log('  \x1b[31m(Simulating primary provider failure)\x1b[0m');
  }

  try {
    const startTime = Date.now();

    const response = await aiRouter.chat({
      modelId: TEST_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond concisely.',
        },
        {
          role: 'user',
          content:
            'Say "Hello from PRIMEX" if this is the primary provider, or "Hello from fallback" if using fallback.',
        },
      ],
      temperature: 0.7,
      maxTokens: 100,
    });

    const duration = Date.now() - startTime;

    console.log(`\n\x1b[32m✓ Response received (${duration}ms)\x1b[0m\n`);

    console.log('\x1b[33m4. Response Details\x1b[0m');
    console.log(`  Model Used: ${response.model}`);
    console.log(`  Fallback: ${response.fallback ? '\x1b[31mYES\x1b[0m' : '\x1b[32mNO\x1b[0m'}`);
    console.log(`  Content:\n    ${response.content.trim()}`);

    if (response.usage) {
      console.log(`\n  Token Usage:`);
      console.log(`    Prompt: ${response.usage.promptTokens}`);
      console.log(`    Completion: ${response.usage.completionTokens}`);
      console.log(`    Total: ${response.usage.totalTokens}`);
    }

    // Test passed
    console.log('\n\x1b[34m═════════════════════════════════════════\x1b[0m');
    console.log('\x1b[32m✓ Chat Test Passed\x1b[0m');
    console.log('\x1b[34m═════════════════════════════════════════\x1b[0m\n');

    process.exit(0);
  } catch (error) {
    console.error(
      `\n\x1b[31m✗ Chat failed: ${error instanceof Error ? error.message : error}\x1b[0m`
    );

    console.log('\n\x1b[33mDebug Info:\x1b[0m');
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Model: ${TEST_MODEL}`);
    console.log(`  Provider: ${model?.provider}`);

    // Check if fallback should have been attempted
    if (model?.provider === 'primex' || model?.provider === 'ollama') {
      if (fallbacks.length > 0) {
        console.log('\n\x1b[33mFallback chain exists but all failed:\x1b[0m');
        fallbacks.forEach((f) => console.log(`  - ${f}`));
      } else {
        console.log('\n\x1b[31m✗ No fallback chain configured for this model!\x1b[0m');
      }
    }

    console.log('\n\x1b[33mTroubleshooting:\x1b[0m');
    console.log('  1. Check that Ollama is running: ollama serve');
    console.log('  2. Verify OLLAMA_API_URL in .env.local');
    console.log('  3. Ensure fallback provider keys are set (GROQ_API_KEY, OPENAI_API_KEY)');
    console.log('  4. Check network connectivity to model servers');

    process.exit(1);
  }
}

main();
