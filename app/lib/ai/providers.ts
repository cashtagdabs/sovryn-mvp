import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  featured?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  maxTokens: number;
  inputCost: number; // per 1M tokens
  outputCost: number; // per 1M tokens
  badge?: 'BEST' | 'FASTEST' | 'CHEAPEST' | 'SMART' | 'RECOMMENDED';
  description?: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  // Other providers
  {
    id: 'openai',
    name: 'OpenAI',
    featured: true, // Make OpenAI the featured provider
    models: [
      {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        contextWindow: 128000,
        maxTokens: 4096,
        inputCost: 10,
        outputCost: 30,
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        contextWindow: 8192,
        maxTokens: 4096,
        inputCost: 30,
        outputCost: 60,
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        contextWindow: 16384,
        maxTokens: 4096,
        inputCost: 0.5,
        outputCost: 1.5,
        badge: 'CHEAPEST',
      },
    ],
  },
  // PRIMEX - Featured first as the primary/best option
  {
    id: 'primex',
    name: 'PRIMEX',
    featured: false, // No longer featured
    models: [
      {
        id: 'primex-ultra',
        name: 'PRIMEX Ultra',
        provider: 'primex',
        contextWindow: 128000,
        maxTokens: 8192,
        inputCost: 0, // Self-hosted = free
        outputCost: 0,
        badge: 'BEST',
        description: 'Our flagship model - fastest, most accurate, 100% private',
      },
      {
        id: 'primex-architect',
        name: 'PRIMEX Architect',
        provider: 'primex',
        contextWindow: 32000,
        maxTokens: 4096,
        inputCost: 0,
        outputCost: 0,
        badge: 'FASTEST',
        description: 'Optimized for code generation and technical tasks',
      },
      {
        id: 'primex-cortex',
        name: 'PRIMEX Cortex',
        provider: 'primex',
        contextWindow: 32000,
        maxTokens: 4096,
        inputCost: 0,
        outputCost: 0,
        badge: 'SMART',
        description: 'Strategic analysis and
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        contextWindow: 200000,
        maxTokens: 4096,
        inputCost: 15,
        outputCost: 75,
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        contextWindow: 200000,
        maxTokens: 4096,
        inputCost: 3,
        outputCost: 15,
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        contextWindow: 200000,
        maxTokens: 4096,
        inputCost: 0.25,
        outputCost: 1.25,
      },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    models: [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'LLaMA 3.3 70B',
        provider: 'groq',
        contextWindow: 131072,
        maxTokens: 32768,
        inputCost: 0.59,
        outputCost: 0.79,
        badge: 'FASTEST',
        description: 'Ultra-fast inference on Groq LPUs',
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'LLaMA 3.1 8B',
        provider: 'groq',
        contextWindow: 131072,
        maxTokens: 8192,
        inputCost: 0.05,
        outputCost: 0.08,
        badge: 'CHEAPEST',
        description: 'Fast and affordable',
      },
    ],
  },
];

export const getModelById = (modelId: string): AIModel | undefined => {
  // Handle both formats: 'gpt-4-turbo-preview' and 'openai:gpt-4-turbo-preview'
  let searchId = modelId;
  if (modelId.includes(':')) {
    searchId = modelId.split(':')[1];
  }

  for (const provider of AI_PROVIDERS) {
    const model = provider.models.find((m) => m.id === searchId);
    if (model) return model;
  }
  return undefined;
};

export const getProviderById = (providerId: string): AIProvider | undefined => {
  return AI_PROVIDERS.find((p) => p.id === providerId);
};

// Initialize AI clients
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;
let groqClient: Groq | null = null;

export const getOpenAIClient = () => {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

export const getAnthropicClient = () => {
  if (!anthropicClient && process.env.ANTHROPIC_API_KEY) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
};

export const getGroqClient = () => {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
};

// PRIMEX client - connects to local backend
export const getPrimexClient = () => {
  const baseURL = process.env.PRIMEX_BACKEND_URL || 'http://localhost:8000';
  return {
    chat: async (messages: Array<{ role: string; content: string }>, model: string = 'llama3.2:1b') => {
      const response = await fetch(`${baseURL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model }),
      });
      if (!response.ok) {
        throw new Error(`PRIMEX API error: ${response.statusText}`);
      }
      return response.json();
    },
  };
};
