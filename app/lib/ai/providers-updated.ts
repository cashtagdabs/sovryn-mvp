/**
 * AI Model Providers Configuration
 * PRIMEX is the DEFAULT and PRIMARY model
 * Other providers are fallback/legacy options
 */

import { PRIMEX_MODELS, getPrimexModel, getAllPrimexModels } from './primex-provider';

export interface AIModel {
  id: string;
  name: string;
  provider: 'primex' | 'openai' | 'anthropic' | 'groq';
  description: string;
  contextWindow: number;
  pricing?: string;
  featured: boolean;
  recommended: boolean;
  badge?: 'NEW' | 'BEST' | 'FASTEST' | 'POPULAR';
}

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  models: AIModel[];
  requiresApiKey: boolean;
  priority: number; // Lower = higher priority
  status: 'primary' | 'secondary' | 'legacy';
}

/**
 * PRIMEX Provider - THE PRIMARY AI
 */
const PRIMEX_PROVIDER: AIProvider = {
  id: 'primex',
  name: 'PRIMEX',
  description: 'The world\'s most advanced AI. Built by SOVRYN. Beats GPT-4, Claude, and all competitors.',
  models: PRIMEX_MODELS.map(model => ({
    id: model.id,
    name: model.name,
    provider: 'primex' as const,
    description: model.description,
    contextWindow: model.contextWindow,
    pricing: 'Included in subscription',
    featured: model.featured,
    recommended: model.id === 'primex-ultra',
    badge: model.id === 'primex-ultra' ? 'BEST' : model.id === 'primex-architect' ? 'FASTEST' : undefined
  })),
  requiresApiKey: false,
  priority: 1,
  status: 'primary'
};

/**
 * OpenAI Provider - LEGACY FALLBACK
 */
const OPENAI_PROVIDER: AIProvider = {
  id: 'openai',
  name: 'OpenAI (Legacy)',
  description: 'Traditional cloud AI. Slower and more expensive than PRIMEX.',
  models: [
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      description: 'Legacy model. PRIMEX is faster and better.',
      contextWindow: 128000,
      pricing: '$0.01/1K tokens',
      featured: false,
      recommended: false
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      description: 'Legacy model. PRIMEX is faster and better.',
      contextWindow: 8192,
      pricing: '$0.03/1K tokens',
      featured: false,
      recommended: false
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      description: 'Legacy model. PRIMEX is much better.',
      contextWindow: 16385,
      pricing: '$0.001/1K tokens',
      featured: false,
      recommended: false
    }
  ],
  requiresApiKey: true,
  priority: 2,
  status: 'legacy'
};

/**
 * Anthropic Provider - LEGACY FALLBACK
 */
const ANTHROPIC_PROVIDER: AIProvider = {
  id: 'anthropic',
  name: 'Anthropic (Legacy)',
  description: 'Traditional cloud AI. Slower and more expensive than PRIMEX.',
  models: [
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      description: 'Legacy model. PRIMEX is faster and better.',
      contextWindow: 200000,
      pricing: '$0.015/1K tokens',
      featured: false,
      recommended: false
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      description: 'Legacy model. PRIMEX is faster and better.',
      contextWindow: 200000,
      pricing: '$0.003/1K tokens',
      featured: false,
      recommended: false
    }
  ],
  requiresApiKey: true,
  priority: 3,
  status: 'legacy'
};

/**
 * Groq Provider - LEGACY FALLBACK
 */
const GROQ_PROVIDER: AIProvider = {
  id: 'groq',
  name: 'Groq (Legacy)',
  description: 'Fast inference, but PRIMEX is still faster and better.',
  models: [
    {
      id: 'mixtral-8x7b',
      name: 'Mixtral 8x7B',
      provider: 'groq',
      description: 'Legacy model. PRIMEX is better.',
      contextWindow: 32768,
      pricing: '$0.0002/1K tokens',
      featured: false,
      recommended: false
    },
    {
      id: 'llama-3-70b',
      name: 'Llama 3 70B',
      provider: 'groq',
      description: 'Legacy model. PRIMEX is better.',
      contextWindow: 8192,
      pricing: '$0.0005/1K tokens',
      featured: false,
      recommended: false
    }
  ],
  requiresApiKey: true,
  priority: 4,
  status: 'legacy'
};

/**
 * All providers, sorted by priority
 */
export const AI_PROVIDERS: AIProvider[] = [
  PRIMEX_PROVIDER,
  OPENAI_PROVIDER,
  ANTHROPIC_PROVIDER,
  GROQ_PROVIDER
].sort((a, b) => a.priority - b.priority);

/**
 * Get default model (PRIMEX Ultra)
 */
export function getDefaultModel(): AIModel {
  return PRIMEX_PROVIDER.models[0]; // PRIMEX Ultra
}

/**
 * Get all available models
 */
export function getAllModels(): AIModel[] {
  return AI_PROVIDERS.flatMap(provider => provider.models);
}

/**
 * Get featured models (PRIMEX models only)
 */
export function getFeaturedModels(): AIModel[] {
  return PRIMEX_PROVIDER.models.filter(model => model.featured);
}

/**
 * Get model by ID
 */
export function getModelById(modelId: string): AIModel | undefined {
  return getAllModels().find(model => model.id === modelId);
}

/**
 * Get provider by ID
 */
export function getProviderById(providerId: string): AIProvider | undefined {
  return AI_PROVIDERS.find(provider => provider.id === providerId);
}

/**
 * Check if model requires API key
 */
export function modelRequiresApiKey(modelId: string): boolean {
  const model = getModelById(modelId);
  if (!model) return false;
  
  const provider = getProviderById(model.provider);
  return provider?.requiresApiKey || false;
}

/**
 * Get recommended model (PRIMEX Ultra)
 */
export function getRecommendedModel(): AIModel {
  return getDefaultModel();
}

/**
 * Get primary provider (PRIMEX)
 */
export function getPrimaryProvider(): AIProvider {
  return PRIMEX_PROVIDER;
}

/**
 * Check if PRIMEX is available
 */
export function isPrimexProvider(providerId: string): boolean {
  return providerId === 'primex';
}

/**
 * Get model display name with badge
 */
export function getModelDisplayName(model: AIModel): string {
  if (model.badge) {
    return `${model.name} [${model.badge}]`;
  }
  return model.name;
}

/**
 * Get model comparison data
 */
export interface ModelComparison {
  model: AIModel;
  speed: 'Ultra Fast' | 'Fast' | 'Medium' | 'Slow';
  quality: 'Excellent' | 'Good' | 'Average';
  cost: 'Included' | 'Low' | 'Medium' | 'High';
  privacy: 'Private' | 'Cloud';
}

export function compareModels(): ModelComparison[] {
  return getAllModels().map(model => {
    const isPrimex = model.provider === 'primex';
    
    return {
      model,
      speed: isPrimex ? 'Ultra Fast' : model.provider === 'groq' ? 'Fast' : 'Medium',
      quality: isPrimex ? 'Excellent' : model.id.includes('gpt-4') || model.id.includes('claude-3-opus') ? 'Good' : 'Average',
      cost: isPrimex ? 'Included' : model.pricing?.includes('0.001') ? 'Low' : model.pricing?.includes('0.03') ? 'High' : 'Medium',
      privacy: isPrimex ? 'Private' : 'Cloud'
    };
  });
}
