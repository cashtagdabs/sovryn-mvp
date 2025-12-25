/**
 * Fallback Strategy for AI Provider Failover
 * 
 * When PRIMEX/Ollama is unavailable, automatically routes to OpenAI/Groq
 * based on model cloning and health checks.
 */

import { AIModel } from './providers';

export interface ProviderHealth {
  provider: string;
  healthy: boolean;
  lastChecked: Date;
  error?: string;
}

interface ProviderFallbackMap {
  [key: string]: string[]; // modelId -> [fallback provider 1, fallback provider 2, ...]
}

// Model cloning map: PRIMEX models -> fallback providers
const MODEL_FALLBACK_MAP: ProviderFallbackMap = {
  // PRIMEX models clone to these fallbacks in order of preference
  // Using current Groq models (Dec 2025) - mixtral and llama2 were decommissioned
  'primex-ultra': ['groq:llama-3.3-70b-versatile', 'groq:llama-3.1-8b-instant'],
  'primex-architect': ['groq:llama-3.3-70b-versatile', 'groq:llama-3.1-8b-instant'],
  'primex-cortex': ['groq:llama-3.3-70b-versatile', 'groq:llama-3.1-8b-instant'],
};

class ProviderHealthManager {
  private healthCache: Map<string, ProviderHealth> = new Map();
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

  async checkProviderHealth(provider: string): Promise<ProviderHealth> {
    // Return cached health if recent
    const cached = this.healthCache.get(provider);
    if (cached && Date.now() - cached.lastChecked.getTime() < this.HEALTH_CHECK_INTERVAL) {
      return cached;
    }

    const health: ProviderHealth = {
      provider,
      healthy: false,
      lastChecked: new Date(),
    };

    try {
      switch (provider) {
        case 'primex':
          health.healthy = await this.checkPrimexHealth();
          break;
        case 'openai':
          health.healthy = process.env.OPENAI_API_KEY ? true : false;
          if (!health.healthy) health.error = 'OPENAI_API_KEY not configured';
          break;
        case 'groq':
          health.healthy = process.env.GROQ_API_KEY ? true : false;
          if (!health.healthy) health.error = 'GROQ_API_KEY not configured';
          break;
        case 'anthropic':
          health.healthy = process.env.ANTHROPIC_API_KEY ? true : false;
          if (!health.healthy) health.error = 'ANTHROPIC_API_KEY not configured';
          break;
      }
    } catch (error) {
      health.healthy = false;
      health.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.healthCache.set(provider, health);
    return health;
  }

  private async checkPrimexHealth(): Promise<boolean> {
    const baseURL = process.env.PRIMEX_BACKEND_URL || 'http://localhost:8000';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.HEALTH_CHECK_TIMEOUT);

      const response = await fetch(`${baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok || response.status === 200;
    } catch (error) {
      return false;
    }
  }

  invalidateCache(provider?: string) {
    if (provider) {
      this.healthCache.delete(provider);
    } else {
      this.healthCache.clear();
    }
  }
}

export const healthManager = new ProviderHealthManager();

/**
 * Resolve fallback model when primary is unavailable
 * 
 * @param modelId - Original model ID (e.g., 'primex-ultra')
 * @param forbiddenProviders - Providers to skip (optional)
 * @returns Fallback model ID or null if none available
 */
export async function resolveFallbackModel(
  modelId: string,
  forbiddenProviders: string[] = []
): Promise<string | null> {
  // Check if this model has fallbacks
  const fallbacks = MODEL_FALLBACK_MAP[modelId];
  if (!fallbacks || fallbacks.length === 0) {
    return null; // No fallback defined
  }

  // Iterate through fallback chain
  for (const fallbackId of fallbacks) {
    const [provider] = fallbackId.split(':');

    // Skip forbidden providers
    if (forbiddenProviders.includes(provider)) {
      continue;
    }

    // Check provider health
    const health = await healthManager.checkProviderHealth(provider);
    if (health.healthy) {
      console.log(`[Fallback] ${modelId} → ${fallbackId} (${provider} healthy)`);
      return fallbackId;
    } else {
      console.warn(
        `[Fallback] Skipping ${fallbackId}: ${health.error || 'provider unhealthy'}`
      );
    }
  }

  console.error(`[Fallback] No healthy fallback available for ${modelId}`);
  return null;
}

/**
 * Add or update model fallback mapping
 * Useful for dynamic configuration
 */
export function setModelFallback(modelId: string, fallbacks: string[]) {
  MODEL_FALLBACK_MAP[modelId] = fallbacks;
}

/**
 * Get fallback chain for a model
 */
export function getFallbackChain(modelId: string): string[] {
  return MODEL_FALLBACK_MAP[modelId] || [];
}
