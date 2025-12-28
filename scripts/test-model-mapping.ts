/**
 * Test Script: Verify Model Registry & Fallback Mappings
 * 
 * Confirms that:
 * 1. All PRIMEX/Ollama models are registered
 * 2. Fallback chains are correctly mapped
 * 3. Clone mapping works as expected
 * 
 * Run: npx ts-node scripts/test-model-mapping.ts
 */

import { getModelById, AI_PROVIDERS } from '@/app/lib/ai/providers';
import { getFallbackChain } from '@/app/lib/ai/fallback';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function test(name: string, condition: boolean, message: string) {
  results.push({ name, passed: condition, message });
  const icon = condition ? '✓' : '✗';
  const color = condition ? '\x1b[32m' : '\x1b[31m';
  console.log(`  ${color}${icon}\x1b[0m ${name}: ${message}`);
}

async function main() {
  console.log('\n\x1b[34m════════════════════════════════════════════════════\x1b[0m');
  console.log('\x1b[34m        Model Registry & Fallback Chain Test\x1b[0m');
  console.log('\x1b[34m════════════════════════════════════════════════════\x1b[0m\n');

  // Test 1: Model Registry
  console.log('\x1b[33m1. Testing Model Registry\x1b[0m');
  let primexCount = 0;
  let ollamaCount = 0;

  for (const provider of AI_PROVIDERS) {
    if (provider.id === 'primex') primexCount = provider.models.length;
    if (provider.id === 'ollama') ollamaCount = provider.models.length;
  }

  test('PRIMEX models registered', primexCount > 0, `Found ${primexCount} models`);
  test('Ollama models registered', ollamaCount > 0, `Found ${ollamaCount} models`);

  // Test 2: Model Lookup
  console.log('\n\x1b[33m2. Testing Model Lookup by ID\x1b[0m');

  const modelsToTest = [
    'primex-ultra',
    'primex-architect',
    'primex-cortex',
    'gpt-oss-20b',
    'llama3.2:1b',
  ];

  for (const modelId of modelsToTest) {
    const model = getModelById(modelId);
    test(
      `Lookup: ${modelId}`,
      model !== undefined,
      model ? `Provider: ${model.provider}` : 'NOT FOUND'
    );
  }

  // Test 3: Fallback Chain Mapping
  console.log('\n\x1b[33m3. Testing Fallback Chain Mappings\x1b[0m');

  const fallbackTests: { [key: string]: number } = {
    'primex-ultra': 4, // Should have 4 fallbacks (Groq x2, OpenAI, Anthropic)
    'primex-architect': 4,
    'primex-cortex': 4,
    'gpt-oss-20b': 2, // Should have 2 fallbacks (Groq x2)
    'llama3.2:1b': 2,
  };

  for (const [modelId, expectedCount] of Object.entries(fallbackTests)) {
    const chain = getFallbackChain(modelId);
    test(
      `Fallback chain: ${modelId}`,
      chain.length === expectedCount,
      `${chain.length} fallbacks (expected ${expectedCount}): ${chain.join(' → ')}`
    );
  }

  // Test 4: Clone Mapping Specifics
  console.log('\n\x1b[33m4. Testing Clone Mapping Details\x1b[0m');

  const cloneTests = [
    {
      model: 'primex-ultra',
      expectedFirstFallback: 'groq:llama-3.3-70b-versatile',
    },
    {
      model: 'gpt-oss-20b',
      expectedFirstFallback: 'groq:llama-3.3-70b-versatile',
    },
  ];

  for (const { model, expectedFirstFallback } of cloneTests) {
    const chain = getFallbackChain(model);
    const firstFallback = chain[0];
    test(
      `Primary fallback: ${model}`,
      firstFallback === expectedFirstFallback,
      firstFallback || 'NOT FOUND'
    );
  }

  // Test 5: Provider Resolution
  console.log('\n\x1b[33m5. Testing Provider Resolution\x1b[0m');

  const providerTests: { [key: string]: string } = {
    'primex-ultra': 'primex',
    'primex-architect': 'primex',
    'gpt-oss-20b': 'ollama',
    'llama3.2:1b': 'ollama',
    'gpt-4-turbo-preview': 'openai',
  };

  for (const [modelId, expectedProvider] of Object.entries(providerTests)) {
    const model = getModelById(modelId);
    test(
      `Provider: ${modelId}`,
      model?.provider === expectedProvider,
      model?.provider || 'NOT FOUND'
    );
  }

  // Test 6: Fallback Chain Priority
  console.log('\n\x1b[33m6. Testing Fallback Chain Priority\x1b[0m');

  const chain = getFallbackChain('primex-ultra');
  const hasGroqFirst = chain[0]?.startsWith('groq');
  const hasOpenAISecond = chain.some((f, i) => i >= 2 && f.startsWith('openai'));

  test(
    'Groq prioritized (free)',
    hasGroqFirst,
    'Groq models appear first in fallback chain'
  );
  test(
    'OpenAI as secondary',
    hasOpenAISecond,
    'OpenAI appears after Groq options'
  );

  // Summary
  console.log('\n\x1b[34m════════════════════════════════════════════════════\x1b[0m');

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`\n  ${passed}/${total} tests passed (${percentage}%)`);

  if (passed === total) {
    console.log(
      '\n\x1b[32m✓ All tests passed! Model registry and fallback mapping verified.\x1b[0m'
    );
  } else {
    console.log(
      '\n\x1b[31m✗ Some tests failed. Check configuration in:\x1b[0m'
    );
    console.log('  - app/lib/ai/providers.ts');
    console.log('  - app/lib/ai/fallback.ts');
  }

  console.log('\n\x1b[34m════════════════════════════════════════════════════\x1b[0m\n');

  process.exit(passed === total ? 0 : 1);
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
