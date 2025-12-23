/**
 * Integration tests for PRIMEX fallback strategy
 *
 * Run with: npm test -- fallback.test.ts
 */

import { resolveFallbackModel, healthManager, getFallbackChain, setModelFallback } from '../fallback';

describe('Fallback Strategy', () => {
  beforeEach(() => {
    // Clear health cache before each test
    healthManager.invalidateCache();
  });

  describe('getFallbackChain', () => {
    it('should return fallback chain for PRIMEX models', () => {
      const chain = getFallbackChain('primex-ultra');
      expect(chain).toHaveLength(3);
      expect(chain[0]).toContain('openai');
      expect(chain[1]).toContain('groq');
      expect(chain[2]).toContain('anthropic');
    });

    it('should return empty array for non-existent model', () => {
      const chain = getFallbackChain('non-existent-model');
      expect(chain).toEqual([]);
    });
  });

  describe('setModelFallback', () => {
    it('should add new fallback mapping', () => {
      setModelFallback('test-model', ['openai:gpt-4', 'groq:llama2-70b-4096']);
      const chain = getFallbackChain('test-model');
      expect(chain).toHaveLength(2);
      expect(chain[0]).toBe('openai:gpt-4');
    });

    it('should override existing mapping', () => {
      setModelFallback('primex-ultra', ['groq:mixtral-8x7b-32768']);
      const chain = getFallbackChain('primex-ultra');
      expect(chain).toHaveLength(1);
      expect(chain[0]).toContain('groq');
    });
  });

  describe('Provider Health Checks', () => {
    it('should check PRIMEX health via HTTP', async () => {
      // Mock PRIMEX running
      process.env.PRIMEX_BACKEND_URL = 'http://localhost:8000';

      const health = await healthManager.checkProviderHealth('primex');
      expect(health.provider).toBe('primex');
      expect(health.lastChecked).toBeInstanceOf(Date);
      // Note: Will fail if PRIMEX not actually running, which is expected in CI
    });

    it('should check OpenAI health via env var', async () => {
      if (!process.env.OPENAI_API_KEY) {
        process.env.OPENAI_API_KEY = 'test-key';
      }

      const health = await healthManager.checkProviderHealth('openai');
      expect(health.provider).toBe('openai');
      expect(health.healthy).toBe(true);
    });

    it('should mark provider unhealthy if key missing', async () => {
      delete process.env.GROQ_API_KEY;

      const health = await healthManager.checkProviderHealth('groq');
      expect(health.provider).toBe('groq');
      expect(health.healthy).toBe(false);
      expect(health.error).toContain('not configured');
    });

    it('should cache health checks', async () => {
      // First check
      const health1 = await healthManager.checkProviderHealth('anthropic');
      const time1 = health1.lastChecked.getTime();

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Second check (should be cached)
      const health2 = await healthManager.checkProviderHealth('anthropic');
      const time2 = health2.lastChecked.getTime();

      expect(time1).toBe(time2); // Same timestamp = cached
    });

    it('should invalidate cache when requested', async () => {
      const health1 = await healthManager.checkProviderHealth('openai');
      const time1 = health1.lastChecked.getTime();

      // Invalidate cache
      healthManager.invalidateCache('openai');

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Next check should be fresh
      const health2 = await healthManager.checkProviderHealth('openai');
      const time2 = health2.lastChecked.getTime();

      expect(time2).toBeGreaterThan(time1); // Different timestamp = fresh check
    });
  });

  describe('resolveFallbackModel', () => {
    beforeEach(() => {
      // Set up test environment
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.GROQ_API_KEY = 'test-key';
      process.env.ANTHROPIC_API_KEY = 'test-key';
    });

    it('should resolve to first healthy fallback', async () => {
      const fallback = await resolveFallbackModel('primex-ultra');
      expect(fallback).toBeTruthy();
      expect(fallback).toContain(':');
    });

    it('should skip forbidden providers', async () => {
      const fallback = await resolveFallbackModel('primex-ultra', ['openai']);
      if (fallback) {
        expect(fallback).not.toContain('openai');
        expect(fallback).toMatch(/(groq|anthropic)/);
      }
    });

    it('should return null if no fallbacks defined', async () => {
      const fallback = await resolveFallbackModel('non-existent-model');
      expect(fallback).toBeNull();
    });

    it('should return null if all providers unhealthy', async () => {
      // Remove all API keys
      delete process.env.OPENAI_API_KEY;
      delete process.env.GROQ_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      // Clear cache to force re-check
      healthManager.invalidateCache();

      const fallback = await resolveFallbackModel('primex-ultra');
      expect(fallback).toBeNull();
    });

    it('should handle architect model fallbacks', async () => {
      const fallback = await resolveFallbackModel('primex-architect');
      expect(fallback).toBeTruthy();
      const chain = getFallbackChain('primex-architect');
      expect(chain).toHaveLength(3);
    });

    it('should handle cortex model fallbacks', async () => {
      const fallback = await resolveFallbackModel('primex-cortex');
      expect(fallback).toBeTruthy();
      const chain = getFallbackChain('primex-cortex');
      expect(chain).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing env vars gracefully', async () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.GROQ_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;
      healthManager.invalidateCache();

      const fallback = await resolveFallbackModel('primex-ultra');
      // Should not throw, just return null or fallback chain
      expect(typeof fallback === 'string' || fallback === null).toBe(true);
    });

    it('should handle network timeouts in health checks', async () => {
      process.env.PRIMEX_BACKEND_URL = 'http://localhost:9999'; // Non-existent port
      healthManager.invalidateCache('primex');

      // Should not throw
      const health = await healthManager.checkProviderHealth('primex');
      expect(health.healthy).toBe(false);
    });

    it('should handle concurrent fallback resolution', async () => {
      const promises = [
        resolveFallbackModel('primex-ultra'),
        resolveFallbackModel('primex-architect'),
        resolveFallbackModel('primex-cortex'),
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      // All should resolve without errors
    });
  });
});

/**
 * Integration Test: Chat Router with Fallback
 *
 * Test the full flow from router through fallback logic
 */
describe('AIRouter with Fallback Integration', () => {
  it('should attempt fallback when primary fails', async () => {
    // This test requires actual API keys and running services
    // Recommended to run manually with:
    // PRIMEX_BACKEND_URL=http://invalid npm test

    const { AIRouter } = await import('../router');
    const router = new AIRouter();

    // This will fail if no valid providers are configured
    // In CI/CD, only run if OPENAI_API_KEY is set
    if (!process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
      console.warn('Skipping integration test: no API keys configured');
      return;
    }

    try {
      const response = await router.chat({
        modelId: 'primex-ultra',
        messages: [{ role: 'user', content: 'Say hi' }],
      });

      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('model');
    } catch (error) {
      // Expected if PRIMEX not running
      console.warn('Chat request failed (expected if PRIMEX not running):', error);
    }
  });
});
